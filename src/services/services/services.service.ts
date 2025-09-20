import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { Pool } from 'pg';
import { Service } from './entities/service.entity';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

@Injectable()
export class ServicesService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async create(dto: CreateServiceDto): Promise<Service> {
    try {
      const query = `
        INSERT INTO services 
        (business_id, category_id, title, description, price, duration_minutes, image, gender_target, is_active)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING *;
      `;
      const values = [
        dto.business_id,
        dto.category_id,
        dto.title,
        dto.description,
        dto.price,
        dto.duration_minutes,
        dto.image || null,
        dto.gender_target,
        dto.is_active ?? true,
      ];
      const result = await this.pool.query<Service>(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating service:', error);
      throw new InternalServerErrorException('Failed to create service');
    }
  }

  async findAll(): Promise<Service[]> {
    try {
      const result = await this.pool.query<Service>('SELECT * FROM services');
      return result.rows;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw new InternalServerErrorException('Failed to fetch services');
    }
  }

  async findOne(id: string): Promise<Service> {
    try {
      const result = await this.pool.query<Service>(
        'SELECT * FROM services WHERE id = $1',
        [id],
      );
      if (!result.rows.length)
        throw new NotFoundException(`Service with id ${id} not found`);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching service:', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException();
    }
  }

  async update(id: string, dto: UpdateServiceDto): Promise<Service> {
    try {
      const fields = Object.keys(dto);
      if (!fields.length)
        throw new InternalServerErrorException('No fields to update');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      const values = fields.map((f) => dto[f]);
      const setClause = fields.map((f, idx) => `${f} = $${idx + 1}`).join(', ');

      const query = `
        UPDATE services
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING *;
      `;
      const result = await this.pool.query<Service>(query, [...values, id]);
      if (!result.rows.length)
        throw new NotFoundException(`Service with id ${id} not found`);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating service:', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException();
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.pool.query(
        'DELETE FROM services WHERE id = $1 RETURNING id',
        [id],
      );
      if (!result.rows.length)
        throw new NotFoundException(`Service with id ${id} not found`);
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException();
    }
  }

  // Bonus: search services by title, category, or business
  async search(term: string): Promise<Service[]> {
    try {
      const query = `
        SELECT * FROM services
        WHERE title ILIKE $1
      `;
      const result = await this.pool.query<Service>(query, [`%${term}%`]);
      return result.rows;
    } catch (error) {
      console.error('Error searching services:', error);
      throw new InternalServerErrorException('Failed to search services');
    }
  }

  async getMostPopularServices(limit: number) {
    const data = await this.pool.query<{
      id: string;
      title: string;
      total_appointments: number;
    }>(
      `SELECT s.id, s.title, COUNT(a.id) AS total_appointments
       FROM Services s
       LEFT JOIN Appointments a ON a.service_id = s.id
       GROUP BY s.id, s.title
       ORDER BY total_appointments DESC
       LIMIT ${limit};`,
    );

    return data.rows;
  }

  async getRevenuePerService() {
    const data = await this.pool.query<{
      id: string;
      title: string;
      total_revenue: number;
    }>(
      `SELECT s.id, s.title, SUM(s.price) AS total_revenue
       FROM Services s
       JOIN Appointments a ON a.service_id = s.id
       WHERE a.payment_status = 'paid'
       GROUP BY s.id, s.title
       ORDER BY total_revenue DESC;`,
    );

    return data.rows;
  }

  async getServicesPerCategory() {
    const data = await this.pool.query<{
      category_name: string;
      total_services: number;
    }>(
      `SELECT c.name AS category_name, COUNT(s.id) AS total_services
       FROM ServiceCategories c
       LEFT JOIN Services s ON s.category_id = c.id
       GROUP BY c.name
       ORDER BY total_services DESC;`,
    );

    return data.rows;
  }

  async getRevenuePerCategory() {
    const data = await this.pool.query<{
      category_name: string;
      total_revenue: number;
    }>(
      `SELECT c.name AS category_name, SUM(s.price) AS total_revenue
       FROM ServiceCategories c
       JOIN Services s ON s.category_id = c.id
       JOIN Appointments a ON a.service_id = s.id
       WHERE a.payment_status = 'paid'
       GROUP BY c.name
       ORDER BY total_revenue DESC;`,
    );

    return data.rows;
  }

  async findMostPopularCategories(limit: number = 5) {
    const query = `
      SELECT c.id, c.name, COUNT(s.id) AS total_services
      FROM servicecategories c
      LEFT JOIN services s ON s.category_id = c.id
      GROUP BY c.id, c.name
      ORDER BY total_services DESC
      LIMIT $1;
    `;

    const result = await this.pool.query<{
      id: string;
      name: string;
      total_services: number;
    }>(query, [limit]);

    return result.rows;
  }

  async getServicesByBeauticianId(beauticianId: string) {
    const beauticianCheck = await this.pool.query(
      'SELECT id FROM beauticians WHERE id = $1',
      [beauticianId],
    );

    if (!beauticianCheck)
      throw new NotFoundException(
        `Beautician with ID ${beauticianId} not found`,
      );

    const query = `
      SELECT s.id, s.title, s.description, s.price, s.duration_minutes, s.image,
            s.gender_target, s.is_active, c.name AS category_name, b.name AS business_name
      FROM services s
      JOIN servicecategories c ON c.id = s.category_id
      JOIN businesses b ON b.id = s.business_id
      JOIN beauticians bt ON bt.business_id = b.id
      WHERE bt.id = $1 AND s.is_active = true;
    `;

    const data = await this.pool.query(query, [beauticianId]);

    return data.rows as Service[];
  }

  async getServicesByBusinessId(businessId: string) {
    const businessCheck = await this.pool.query(
      'SELECT id FROM businesses WHERE id = $1',
      [businessId],
    );

    if (!businessCheck)
      throw new NotFoundException(`Business with ID ${businessId} not found`);

    const query = `
      SELECT s.description, s.image, s.price, s.rating,
      s.title, s.is_active, s.duration_minutes  FROM services s
      JOIN businesses b
      ON s.business_id = s.id
      WHERE b.id = $1
      ORDER BY s.rating
    `;

    const data = await this.pool.query<{
      description: string;
      image: string;
      price: string;
      rating: string;
      title: string;
      is_active: boolean;
      duration_minutes: string;
    }>(query, [businessId]);

    return data.rows;
  }
}
