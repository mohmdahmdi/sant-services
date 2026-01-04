/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Business } from './entities/business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';

export interface BusinessWithLocation {
  id: string;
  name: string;
  description: string;
  logo: string;
  cover_image: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  instagram: string;
  whatsapp: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateBusinessDto) {
    try {
      const business = this.businessRepository.create(dto);
      return await this.businessRepository.save(business);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Business with this email already exists');
      }
      console.error('Database error in BusinessService.create:', error);
      throw new InternalServerErrorException('Failed to create business');
    }
  }

  async findAll() {
    try {
      return await this.businessRepository.find({
        order: { created_at: 'DESC' },
        relations: ['location', 'businessType'],
      });
    } catch (error) {
      console.error('Database error in BusinessService.findAll:', error);
      throw new InternalServerErrorException('Failed to fetch businesses');
    }
  }

  async findOne(id: string) {
    const business = await this.businessRepository.findOne({
      where: { id },
      relations: ['location', 'businessType'],
    });
    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }
    return business;
  }

  async update(id: string, dto: UpdateBusinessDto) {
    const business = await this.businessRepository.findOneBy({ id });
    if (!business) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }

    Object.assign(business, dto);

    try {
      return await this.businessRepository.save(business);
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Business with this email already exists');
      }
      console.error('Database error in BusinessService.update:', error);
      throw new InternalServerErrorException('Failed to update business');
    }
  }

  async remove(id: string) {
    const result = await this.businessRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Business with ID ${id} not found`);
    }
    return { message: `Business ${id} deleted successfully` };
  }

  async search(term: string) {
    return await this.businessRepository
      .createQueryBuilder('business')
      .leftJoinAndSelect('business.businessType', 'businessType')
      .where('LOWER(business.name) LIKE LOWER(:term)', { term: `%${term}%` })
      .orWhere('LOWER(businessType.name) LIKE LOWER(:term)', {
        term: `%${term}%`,
      })
      .orderBy('business.created_at', 'DESC')
      .getMany();
  }

  async findByUserId(ownerId: string): Promise<Business[]> {
    return await this.businessRepository.find({
      where: { owner_id: ownerId },
      relations: ['location', 'businessType'],
    });
  }

  async getTotalBusinesses() {
    const count = await this.businessRepository.count();
    return { total_businesses: count };
  }

  async getAverageRatingPerBusiness() {
    interface AvgRatingResult {
      id: string;
      name: string;
      avg_service_rating: string;
    }

    const result = await this.dataSource.query<AvgRatingResult[]>(
      `
        SELECT b.id, b.name, AVG(s.rating)::text AS avg_service_rating
        FROM businesses b
        JOIN services s ON s.business_id = b.id
        GROUP BY b.id, b.name
      `,
    );

    return result.map((row) => ({
      ...row,
      avg_service_rating: parseFloat(row.avg_service_rating) || 0,
    }));
  }

  async getActiveServicesPerBusiness() {
    interface ActiveServicesResult {
      id: string;
      name: string;
      active_services: string;
    }

    const result = await this.dataSource.query<ActiveServicesResult[]>(
      `
        SELECT b.id, b.name, COUNT(s.id)::text AS active_services
        FROM businesses b
        LEFT JOIN services s ON s.business_id = b.id AND s.is_active = TRUE
        GROUP BY b.id, b.name
      `,
    );

    return result.map((row) => ({
      ...row,
      active_services: parseInt(row.active_services, 10) || 0,
    }));
  }

  async getByBusinessType(businessTypeId: string) {
    const businessTypeExists = await this.dataSource
      .getRepository('BusinessType')
      .findOneBy({ id: businessTypeId });

    if (!businessTypeExists) {
      throw new NotFoundException(
        `Business type with id: ${businessTypeId} not found!`,
      );
    }

    const result = await this.dataSource.query<BusinessWithLocation[]>(
      `
        SELECT b.id, b.name, b.description, b.logo, b.cover_image,
               l.city, l.district, l.address,
               b.phone, b.email, b.website, b.instagram, b.whatsapp,
               b.is_verified, b.is_active, b.created_at
        FROM businesses b
        LEFT JOIN locations l ON b.location_id = l.id
        WHERE b.business_type_id = $1
        ORDER BY b.name
      `,
      [businessTypeId],
    );

    return result;
  }

  async getTopBusinessesByAppointments(days: number, limit: number) {
    interface TopBusinessResult {
      id: string;
      name: string;
      logo: string;
      cover_image: string;
      website: string;
      is_verified: boolean;
      rating: string;
      city: string;
      district: string;
      address: string;
      total_appointments: string;
    }

    const result = await this.dataSource.query<TopBusinessResult[]>(
      `
        SELECT 
          b.id,
          b.name,
          b.logo,
          b.cover_image,
          b.website,
          b.is_verified,
          b.rating::text,
          l.city,
          l.district,
          l.address,
          COUNT(a.id)::text AS total_appointments
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        JOIN businesses b ON s.business_id = b.id
        LEFT JOIN locations l ON b.location_id = l.id
        WHERE a.created_at >= NOW() - ($1 || ' days')::interval
          AND a.status != 'canceled'
        GROUP BY b.id, b.name, b.logo, b.cover_image, b.website, 
                 b.is_verified, b.rating, l.city, l.district, l.address
        ORDER BY total_appointments DESC
        LIMIT $2
      `,
      [days, limit],
    );

    return result.map((row) => ({
      ...row,
      rating: parseFloat(row.rating) || 0,
      total_appointments: parseInt(row.total_appointments, 10) || 0,
    }));
  }
}
