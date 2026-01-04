import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Beautician } from './entities/beautician.entity';
import { CreateBeauticianDto } from './dto/create-beautician.dto';
import { UpdateBeauticianDto } from './dto/update-beautician.dto';

export interface BeauticianWithUser {
  id: string;
  bio: string;
  experience_years: number;
  rating: number;
  specialties: string[];
  user_id: string;
  profile_picture: string;
  full_name: string;
}

export interface BeauticianByService {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  business_name: string;
  business_id: string;
}

@Injectable()
export class BeauticiansService {
  constructor(
    @InjectRepository(Beautician)
    private beauticianRepository: Repository<Beautician>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateBeauticianDto): Promise<Beautician> {
    try {
      const beautician = this.beauticianRepository.create(dto);
      return await this.beauticianRepository.save(beautician);
    } catch (error) {
      console.error('Database error in create beautician:', error);
      throw new InternalServerErrorException('Failed to create beautician');
    }
  }

  async findAll(): Promise<Beautician[]> {
    return await this.beauticianRepository.find({
      relations: ['user', 'business'],
    });
  }

  async findOne(id: string): Promise<Beautician> {
    const beautician = await this.beauticianRepository.findOne({
      where: { id },
      relations: ['user', 'business'],
    });
    if (!beautician) {
      throw new NotFoundException(`Beautician with id ${id} not found`);
    }
    return beautician;
  }

  async update(id: string, dto: UpdateBeauticianDto): Promise<Beautician> {
    const beautician = await this.beauticianRepository.findOneBy({ id });
    if (!beautician) {
      throw new NotFoundException(`Beautician with id ${id} not found`);
    }

    Object.assign(beautician, dto);
    return await this.beauticianRepository.save(beautician);
  }

  async remove(id: string): Promise<void> {
    const result = await this.beauticianRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Beautician with id ${id} not found`);
    }
  }

  async search(term: string): Promise<Beautician[]> {
    return await this.beauticianRepository
      .createQueryBuilder('bt')
      .leftJoinAndSelect('bt.user', 'u')
      .where('bt.bio ILIKE :term', { term: `%${term}%` })
      .orWhere(':term = ANY(bt.specialties)', { term })
      .getMany();
  }

  async getTotalBeauticians() {
    const count = await this.beauticianRepository.count();
    return { total_beauticians: count };
  }

  async getAverageRatingPerBeautician() {
    interface AvgRatingResult {
      id: string;
      full_name: string;
      avg_rating: string;
    }

    const result = await this.dataSource.query<AvgRatingResult[]>(
      `
        SELECT b.id, u.full_name, AVG(b.rating)::text AS avg_rating
        FROM beauticians b
        JOIN users u ON b.user_id = u.id
        GROUP BY b.id, u.full_name
      `,
    );

    return result.map((row) => ({
      ...row,
      avg_rating: parseFloat(row.avg_rating) || 0,
    }));
  }

  async getAppointmentsPerBeautician() {
    interface AppointmentsResult {
      id: string;
      full_name: string;
      total_appointments: string;
    }

    const result = await this.dataSource.query<AppointmentsResult[]>(
      `
        SELECT b.id, u.full_name, COUNT(a.id)::text AS total_appointments
        FROM beauticians b
        JOIN users u ON b.user_id = u.id
        LEFT JOIN appointments a ON a.beautician_id = b.id
        GROUP BY b.id, u.full_name
        ORDER BY total_appointments DESC
      `,
    );

    return result.map((row) => ({
      ...row,
      total_appointments: parseInt(row.total_appointments, 10) || 0,
    }));
  }

  async getBeauticiansByServiceId(
    serviceId: string,
  ): Promise<BeauticianByService[]> {
    const result = await this.dataSource.query<BeauticianByService[]>(
      `
        SELECT bt.id, u.full_name, u.phone, u.email,
               b.name AS business_name, b.id AS business_id
        FROM beauticians bt
        JOIN users u ON u.id = bt.user_id
        JOIN businesses b ON b.id = bt.business_id
        JOIN services s ON s.business_id = b.id
        WHERE s.id = $1
        ORDER BY u.full_name;
      `,
      [serviceId],
    );
    return result;
  }

  async getBeauticiansByBusinessId(
    businessId: string,
  ): Promise<BeauticianWithUser[]> {
    const result = await this.dataSource.query<BeauticianWithUser[]>(
      `
        SELECT bt.id, bt.bio, bt.experience_years, bt.rating,
               bt.specialties, u.id AS user_id, u.profile_picture, u.full_name
        FROM beauticians bt
        JOIN users u ON u.id = bt.user_id
        WHERE bt.business_id = $1
        ORDER BY bt.experience_years DESC;
      `,
      [businessId],
    );

    return result.map((row) => ({
      ...row,
      rating:
        typeof row.rating === 'string' ? parseFloat(row.rating) : row.rating,
    }));
  }
}
