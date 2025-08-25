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
}
