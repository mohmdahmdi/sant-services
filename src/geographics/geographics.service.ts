import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { Pool } from 'pg';
import { Geographic } from './entities/geographic.entity';
import { CreateGeographicDto } from './dto/create-geographic.dto';
import { UpdateGeographicDto } from './dto/update-geographic.dto';

@Injectable()
export class GeographicsService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async create(dto: CreateGeographicDto): Promise<Geographic> {
    try {
      const query = `
        INSERT INTO locations (country, city, district, address, latitude, longitude)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *;
      `;
      const values = [
        dto.country,
        dto.city,
        dto.district,
        dto.address,
        dto.latitude,
        dto.longitude,
      ];
      const result = await this.pool.query<Geographic>(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating geographic:', error);
      throw new InternalServerErrorException('Failed to create geographic');
    }
  }

  async findAll(): Promise<Geographic[]> {
    try {
      const result = await this.pool.query<Geographic>(
        'SELECT * FROM locations',
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching geographics:', error);
      throw new InternalServerErrorException('Failed to fetch geographics');
    }
  }

  async findOne(id: string): Promise<Geographic> {
    try {
      const result = await this.pool.query<Geographic>(
        'SELECT * FROM locations WHERE id = $1',
        [id],
      );
      if (!result.rows.length)
        throw new NotFoundException(`Geographic with id ${id} not found`);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching geographic:', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException();
    }
  }

  async update(id: string, dto: UpdateGeographicDto): Promise<Geographic> {
    try {
      const fields = Object.keys(dto);
      if (!fields.length)
        throw new InternalServerErrorException('No fields to update');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      const values = fields.map((f) => dto[f]);
      const setClause = fields.map((f, idx) => `${f} = $${idx + 1}`).join(', ');

      const query = `
        UPDATE locations
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING *;
      `;
      const result = await this.pool.query<Geographic>(query, [...values, id]);
      if (!result.rows.length)
        throw new NotFoundException(`Geographic with id ${id} not found`);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating geographic:', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException();
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.pool.query(
        'DELETE FROM locations WHERE id = $1 RETURNING id',
        [id],
      );
      if (!result.rows.length)
        throw new NotFoundException(`Geographic with id ${id} not found`);
    } catch (error) {
      console.error('Error deleting geographic:', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException();
    }
  }

  async search(term: string): Promise<Geographic[]> {
    try {
      const query = `
        SELECT * FROM locations
        WHERE city ILIKE $1 OR district ILIKE $1 OR country ILIKE $1
      `;
      const result = await this.pool.query<Geographic>(query, [`%${term}%`]);
      return result.rows;
    } catch (error) {
      console.error('Error searching geographics:', error);
      throw new InternalServerErrorException('Failed to search geographics');
    }
  }
}
