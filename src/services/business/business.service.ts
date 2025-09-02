import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  Inject,
} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { Business } from './entities/business.entity';

@Injectable()
export class BusinessService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async create(dto: CreateBusinessDto) {
    try {
      const query = `
        INSERT INTO businesses (
          owner_id, name, description, logo, cover_image,
          location_id, business_type_id, phone, email, website,
          instagram, whatsapp, is_verified, is_active, created_at
        ) VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14, NOW()
        )
        RETURNING *;
      `;

      const values = [
        dto.owner_id,
        dto.name,
        dto.description ?? null,
        dto.logo ?? null,
        dto.cover_image ?? null,
        dto.location_id,
        dto.business_type_id,
        dto.phone ?? null,
        dto.email ?? null,
        dto.website ?? null,
        dto.instagram ?? null,
        dto.whatsapp ?? null,
        dto.is_verified ?? false,
        dto.is_active ?? true,
      ];

      const result = await this.pool.query(query, values);
      return result.rows[0] as Business;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505') {
        throw new ConflictException('Business with this email already exists');
      }
      console.error('Database error in BusinessService.create:', error);
      throw new InternalServerErrorException('Failed to create business');
    }
  }

  async findAll() {
    try {
      const result = await this.pool.query(
        `SELECT * FROM businesses ORDER BY created_at DESC`,
      );
      return result.rows as Business[];
    } catch (error) {
      console.error('Database error in BusinessService.findAll:', error);
      throw new InternalServerErrorException('Failed to fetch businesses');
    }
  }

  async findOne(id: string) {
    try {
      const result = await this.pool.query(
        `SELECT * FROM businesses WHERE id = $1`,
        [id],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException(`Business with ID ${id} not found`);
      }

      return result.rows[0] as Business;
    } catch (error) {
      console.error('Database error in BusinessService.findOne:', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException('Failed to fetch business');
    }
  }

  async update(id: string, dto: UpdateBusinessDto) {
    try {
      const fields = Object.keys(dto);
      if (fields.length === 0) {
        throw new InternalServerErrorException('No fields provided for update');
      }

      const values: any[] = [];
      const setClause = fields
        .map((field, index) => {
          values.push((dto as Business)[field]);
          return `${field} = $${index + 1}`;
        })
        .join(', ');

      const query = `
        UPDATE businesses
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING *;
      `;

      const result = await this.pool.query(query, [...values, id]);

      if (result.rows.length === 0) {
        throw new NotFoundException(`Business with ID ${id} not found`);
      }

      return result.rows[0] as Business;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505') {
        throw new ConflictException('Business with this email already exists');
      }
      console.error('Database error in BusinessService.update:', error);
      throw new InternalServerErrorException('Failed to update business');
    }
  }

  async remove(id: string) {
    try {
      const result = await this.pool.query(
        `DELETE FROM businesses WHERE id = $1 RETURNING *;`,
        [id],
      );

      if (result.rows.length === 0) {
        throw new NotFoundException(`Business with ID ${id} not found`);
      }

      return { message: `Business ${id} deleted successfully` };
    } catch (error) {
      console.error('Database error in BusinessService.remove:', error);
      throw new InternalServerErrorException('Failed to delete business');
    }
  }

  async search(term: string) {
    try {
      const result = await this.pool.query(
        `
        SELECT b.*
        FROM businesses b
        LEFT JOIN business_types bt ON b.business_type_id = bt.id
        WHERE LOWER(b.name) LIKE LOWER($1)
           OR LOWER(bt.name) LIKE LOWER($1)
        ORDER BY b.created_at DESC
      `,
        [`%${term}%`],
      );

      return result.rows as Business[];
    } catch (error) {
      console.error('Database error in BusinessService.search:', error);
      throw new InternalServerErrorException('Failed to search businesses');
    }
  }

  async findByUserId(ownerId: string): Promise<Business[]> {
    try {
      const { rows } = await this.pool.query(
        `SELECT * FROM Businesses WHERE owner_id = $1`,
        [ownerId],
      );
      return rows as Business[];
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        `Failed to fetch businesses for user ${ownerId}`,
        error,
      );
    }
  }

  async getTotalBusinesses() {
    const data = await this.pool.query<{ total_businesses: number }>(
      `SELECT COUNT(*) AS total_businesses FROM Businesses;`,
    );

    return data.rows[0];
  }

  async getAverageRatingPerBusiness() {
    const data = await this.pool.query<{
      id: string;
      name: string;
      avg_service_rating: number;
    }>(
      `SELECT b.id, b.name, AVG(s.rating) AS avg_service_rating
       FROM Businesses b
       JOIN Services s ON s.business_id = b.id
       GROUP BY b.id, b.name;`,
    );

    return data.rows;
  }

  async getActiveServicesPerBusiness() {
    const data = await this.pool.query<{
      id: string;
      name: string;
      active_services: number;
    }>(
      `SELECT b.id, b.name, COUNT(s.id) AS active_services
       FROM Businesses b
       LEFT JOIN Services s ON s.business_id = b.id AND s.is_active = TRUE
       GROUP BY b.id, b.name;`,
    );

    return data.rows;
  }

  async getByBusinessType(businessTypeId: string) {
    const exist = await this.pool.query(
      `SELECT id FROM business_types WHERE id = '${businessTypeId}'`,
    );

    if (!exist.rowCount)
      throw new NotFoundException(
        `business type with id: ${businessTypeId} not found!`,
      );

    const result = await this.pool.query<
      {
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
      }[]
    >(
      `
        SELECT b.id, b.name, b.description, b.logo, b.cover_image,
               l.city, l.district, l.address,
               b.phone, b.email, b.website, b.instagram, b.whatsapp,
               b.is_verified, b.is_active, b.created_at
        FROM businesses b
        LEFT JOIN locations l ON b.location_id = l.id
        WHERE b.business_type_id = $1
        ORDER BY b.name;
        `,
      [businessTypeId],
    );
    return result.rows;
  }
}
