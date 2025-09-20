// src/beauticians/beauticians.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { Pool } from 'pg';
import { Beautician } from './entities/beautician.entity';
import { CreateBeauticianDto } from './dto/create-beautician.dto';
import { UpdateBeauticianDto } from './dto/update-beautician.dto';

@Injectable()
export class BeauticiansService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async create(dto: CreateBeauticianDto): Promise<Beautician> {
    try {
      const query = `
        INSERT INTO beauticians (user_id, business_id, bio, experience_years, specialties, is_freelancer, rating)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      const values = [
        dto.user_id,
        dto.business_id,
        dto.bio || null,
        dto.experience_years || null,
        dto.specialties || [],
        dto.is_freelancer || false,
        dto.rating || 0.0,
      ];

      const result = await this.pool.query<Beautician>(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Database error in create beautician:', error);
      throw new InternalServerErrorException('Failed to create beautician');
    }
  }

  async findAll(): Promise<Beautician[]> {
    try {
      const result = await this.pool.query<Beautician>(
        'SELECT * FROM beauticians',
      );
      return result.rows;
    } catch (error) {
      console.error('Database error in findAll beauticians:', error);
      throw new InternalServerErrorException('Failed to fetch beauticians');
    }
  }

  async findOne(id: string): Promise<Beautician> {
    try {
      const result = await this.pool.query<Beautician>(
        'SELECT * FROM beauticians WHERE id = $1',
        [id],
      );
      if (!result.rows.length)
        throw new NotFoundException(`Beautician with id ${id} not found`);
      return result.rows[0];
    } catch (error) {
      console.error('Database error in findOne beautician:', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException();
    }
  }

  async update(id: string, dto: UpdateBeauticianDto): Promise<Beautician> {
    try {
      const fields = Object.keys(dto);
      if (!fields.length)
        throw new InternalServerErrorException('No fields provided for update');

      const values: any[] = [];
      for (const field of fields) {
        values.push(dto[field]);
      }

      const setClause = fields
        .map((field, index) => `${field} = $${index + 1}`)
        .join(', ');
      const query = `
        UPDATE beauticians
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING *;
      `;

      const result = await this.pool.query<Beautician>(query, [...values, id]);
      if (!result.rows.length)
        throw new NotFoundException(`Beautician with id ${id} not found`);
      return result.rows[0];
    } catch (error) {
      console.error('Database error in update beautician:', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException();
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.pool.query(
        'DELETE FROM beauticians WHERE id = $1 RETURNING id',
        [id],
      );
      if (!result.rows.length)
        throw new NotFoundException(`Beautician with id ${id} not found`);
    } catch (error) {
      console.error('Database error in remove beautician:', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException();
    }
  }

  async search(term: string): Promise<Beautician[]> {
    try {
      const query = `
        SELECT * FROM beauticians
        WHERE bio ILIKE $1 OR $2 = ANY(specialties)
      `;
      const values = [`%${term}%`, term];
      const result = await this.pool.query<Beautician>(query, values);
      return result.rows;
    } catch (error) {
      console.error('Database error in search beauticians:', error);
      throw new InternalServerErrorException('Failed to search beauticians');
    }
  }

  async getTotalBeauticians() {
    const data = await this.pool.query<{ total_beauticians: number }>(
      `SELECT COUNT(*) AS total_beauticians FROM Beauticians;`,
    );

    return data.rows[0];
  }

  async getAverageRatingPerBeautician() {
    const data = await this.pool.query<{
      id: string;
      full_name: string;
      avg_rating: number;
    }>(
      `SELECT b.id, u.full_name, AVG(b.rating) AS avg_rating
       FROM Beauticians b
       JOIN Users u ON b.user_id = u.id
       GROUP BY b.id, u.full_name;`,
    );

    return data.rows;
  }

  async getAppointmentsPerBeautician() {
    const data = await this.pool.query<{
      id: string;
      full_name: string;
      total_appointments: number;
    }>(
      `SELECT b.id, u.full_name, COUNT(a.id) AS total_appointments
       FROM Beauticians b
       JOIN Users u ON b.user_id = u.id
       LEFT JOIN Appointments a ON a.beautician_id = b.id
       GROUP BY b.id, u.full_name
       ORDER BY total_appointments DESC;`,
    );

    return data.rows;
  }

  async getBeauticiansByServiceId(serviceId: string) {
    const query = `
      SELECT bt.id, u.full_name, u.phone, u.email,
             b.name AS business_name, b.id AS business_id
      FROM beauticians bt
      JOIN users u ON u.id = bt.user_id
      JOIN businesses b ON b.id = bt.business_id
      JOIN services s ON s.business_id = b.id
      WHERE s.id = $1
      ORDER BY u.full_name;
    `;

    const result = await this.pool.query<
      {
        id: string;
        full_name: string;
        phone: string;
        email: string;
        business_name: string;
        business_id: string;
      }[]
    >(query, [serviceId]);

    return result.rows;
  }

  async getBeauticiansByBusinessId(businessId: string) {
    const query = `
      SELECT bt.id, bt.bio, bt.experience_years, bt.rating,
	    bt.specialties, u.id AS user_id, u.profile_picture, u.full_name
      FROM beauticians bt
      JOIN users u ON u.id = bt.user_id
      JOIN businesses b ON b.id = bt.business_id
      WHERE b.id = $1
      ORDER BY bt.experience_years;
    `;

    const result = await this.pool.query<
      {
        id: string;
        bio: string;
        experience_years: number;
        rating: string;
        specialties: string[];
        user_id: string;
        profile_picture: string;
        full_name: string;
      }[]
    >(query, [businessId]);

    return result.rows;
  }
}
