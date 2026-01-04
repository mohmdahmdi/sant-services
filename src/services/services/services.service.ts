import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

export interface ServiceWithDetails {
  id: string;
  title: string;
  description: string;
  price: number;
  duration_minutes: number;
  image: string;
  gender_target: string;
  is_active: boolean;
  rating: number;
  category_name: string;
  business_name: string;
}

export interface ServiceListItem {
  description: string;
  image: string;
  price: number;
  rating: number;
  title: string;
  is_active: boolean;
  duration_minutes: number;
}

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateServiceDto): Promise<Service> {
    try {
      const service = this.serviceRepository.create(dto);
      return await this.serviceRepository.save(service);
    } catch (error) {
      console.error('Error creating service:', error);
      throw new InternalServerErrorException('Failed to create service');
    }
  }

  async findAll(): Promise<Service[]> {
    return await this.serviceRepository.find({
      relations: ['category', 'business'],
    });
  }

  async findOne(id: string): Promise<Service> {
    const service = await this.serviceRepository.findOne({
      where: { id },
      relations: ['category', 'business'],
    });
    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
    return service;
  }

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    const service = await this.serviceRepository.findOneBy({ id });
    if (!service) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }

    Object.assign(service, dto);
    return await this.serviceRepository.save(service);
  }

  async remove(id: string): Promise<void> {
    const result = await this.serviceRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Service with id ${id} not found`);
    }
  }

  async search(term: string): Promise<Service[]> {
    return await this.serviceRepository
      .createQueryBuilder('service')
      .where('service.title ILIKE :term', { term: `%${term}%` })
      .getMany();
  }

  async getMostPopularServices(limit: number) {
    interface PopularService {
      id: string;
      title: string;
      total_appointments: string;
    }

    const result = await this.dataSource.query<PopularService[]>(
      `
        SELECT s.id, s.title, COUNT(a.id)::text AS total_appointments
        FROM services s
        LEFT JOIN appointments a ON a.service_id = s.id
        GROUP BY s.id, s.title
        ORDER BY total_appointments DESC
        LIMIT $1
      `,
      [limit],
    );

    return result.map((row) => ({
      ...row,
      total_appointments: parseInt(row.total_appointments, 10) || 0,
    }));
  }

  async getRevenuePerService() {
    interface RevenueService {
      id: string;
      title: string;
      total_revenue: string;
    }

    const result = await this.dataSource.query<RevenueService[]>(
      `
        SELECT s.id, s.title, SUM(s.price)::text AS total_revenue
        FROM services s
        JOIN appointments a ON a.service_id = s.id
        WHERE a.payment_status = 'paid'
        GROUP BY s.id, s.title
        ORDER BY total_revenue DESC
      `,
    );

    return result.map((row) => ({
      ...row,
      total_revenue: parseFloat(row.total_revenue) || 0,
    }));
  }

  async getServicesPerCategory() {
    interface CategoryCount {
      category_name: string;
      total_services: string;
    }

    const result = await this.dataSource.query<CategoryCount[]>(
      `
        SELECT c.name AS category_name, COUNT(s.id)::text AS total_services
        FROM servicecategories c
        LEFT JOIN services s ON s.category_id = c.id
        GROUP BY c.name
        ORDER BY total_services DESC
      `,
    );

    return result.map((row) => ({
      ...row,
      total_services: parseInt(row.total_services, 10) || 0,
    }));
  }

  async getRevenuePerCategory() {
    interface CategoryRevenue {
      category_name: string;
      total_revenue: string;
    }

    const result = await this.dataSource.query<CategoryRevenue[]>(
      `
        SELECT c.name AS category_name, SUM(s.price)::text AS total_revenue
        FROM servicecategories c
        JOIN services s ON s.category_id = c.id
        JOIN appointments a ON a.service_id = s.id
        WHERE a.payment_status = 'paid'
        GROUP BY c.name
        ORDER BY total_revenue DESC
      `,
    );

    return result.map((row) => ({
      ...row,
      total_revenue: parseFloat(row.total_revenue) || 0,
    }));
  }

  async findMostPopularCategories(limit: number = 5) {
    interface PopularCategory {
      id: string;
      name: string;
      total_services: string;
    }

    const result = await this.dataSource.query<PopularCategory[]>(
      `
        SELECT c.id, c.name, COUNT(s.id)::text AS total_services
        FROM servicecategories c
        LEFT JOIN services s ON s.category_id = c.id
        GROUP BY c.id, c.name
        ORDER BY total_services DESC
        LIMIT $1
      `,
      [limit],
    );

    return result.map((row) => ({
      ...row,
      total_services: parseInt(row.total_services, 10) || 0,
    }));
  }

  async getServicesByBeauticianId(
    beauticianId: string,
  ): Promise<ServiceWithDetails[]> {
    const beautician = await this.dataSource
      .getRepository('Beautician')
      .findOneBy({ id: beauticianId });

    if (!beautician) {
      throw new NotFoundException(
        `Beautician with ID ${beauticianId} not found`,
      );
    }

    const result = await this.dataSource.query<ServiceWithDetails[]>(
      `
        SELECT s.id, s.title, s.description, s.price, s.duration_minutes, s.image,
               s.gender_target, s.is_active, c.name AS category_name, b.name AS business_name
        FROM services s
        JOIN servicecategories c ON c.id = s.category_id
        JOIN businesses b ON b.id = s.business_id
        JOIN beauticians bt ON bt.business_id = b.id
        WHERE bt.id = $1 AND s.is_active = true
      `,
      [beauticianId],
    );

    return result.map((row) => ({
      ...row,
      price: typeof row.price === 'string' ? parseFloat(row.price) : row.price,
      rating:
        typeof row.rating === 'string' ? parseFloat(row.rating) : row.rating,
      duration_minutes:
        typeof row.duration_minutes === 'string'
          ? parseInt(row.duration_minutes, 10)
          : row.duration_minutes,
    }));
  }

  async getServicesByBusinessId(
    businessId: string,
  ): Promise<ServiceListItem[]> {
    const business = await this.dataSource
      .getRepository('Business')
      .findOneBy({ id: businessId });

    if (!business) {
      throw new NotFoundException(`Business with ID ${businessId} not found`);
    }

    const result = await this.dataSource.query<
      {
        description: string;
        image: string;
        price: string;
        rating: string;
        title: string;
        is_active: boolean;
        category_id: string;
        category_name: string;
        duration_minutes: string;
      }[]
    >(
      `
        SELECT s.description, s.image, s.price::text, s.rating::text, s.title,
               s.is_active, s.duration_minutes::text, c.name AS category_name,
               s.category_id
        FROM services s
        JOIN servicecategories c ON c.id = s.category_id
        WHERE s.business_id = $1
        ORDER BY s.rating DESC
      `,
      [businessId],
    );

    return result.map((row) => ({
      description: row.description,
      image: row.image,
      price: parseFloat(row.price) || 0,
      rating: parseFloat(row.rating) || 0,
      title: row.title,
      category_id: row.category_id,
      category_name: row.category_name,
      is_active: row.is_active,
      duration_minutes: parseInt(row.duration_minutes, 10) || 0,
    }));
  }
}
