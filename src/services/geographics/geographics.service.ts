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

  async findNearby(lat: number, lon: number, radiusKm: number = 5) {
    try {
      const query = `
      SELECT b.id, b.name, l.city, l.district, l.address,
             ST_Distance(l.geom, ST_MakePoint($2, $1)::geography) AS distance_m
      FROM businesses b
      JOIN locations l ON b.location_id = l.id
      WHERE ST_DWithin(l.geom, ST_MakePoint($2, $1)::geography, $3)
      ORDER BY distance_m;
    `;

      // Note: order is lon, lat for PostGIS
      const result = await this.pool.query(query, [lat, lon, radiusKm * 1000]);
      return result.rows as Geographic[];
    } catch {
      throw new InternalServerErrorException(
        'Failed to fetch nearby businesses',
      );
    }
  }

  async findLocationByBusinessId(businessId: string) {
    const exist = (await this.pool.query('SELECT * FROM businesses')).rows;

    if (!exist)
      throw new NotFoundException(`business with id ${businessId} not found!`);
    const query = `
      SELECT l.id, l.country, l.city, l.district, l.address,
             l.latitude, l.longitude
      FROM locations l
      JOIN businesses b ON b.location_id = l.id
      WHERE b.id = $1;
    `;

    const result = await this.pool.query<{
      id: string;
      country: string;
      city: string;
      district: string;
      address: string;
      latitude: string;
      longitude: string;
    }>(query, [businessId]);

    if (!result) {
      throw new NotFoundException(
        `didn't found any location for ${businessId}`,
      );
    }
    return result.rows[0] || {};
  }
}
