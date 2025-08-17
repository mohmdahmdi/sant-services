import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { Business } from './entities/business.entity';

@Injectable()
export class BusinessService {
  constructor(private readonly pool: Pool) {}

  async create(createBusinessDto: CreateBusinessDto): Promise<Business> {
    try {
      const {
        owner_id,
        name,
        description,
        logo,
        cover_image,
        location_id,
        business_type_id,
        phone,
        email,
        website,
        instagram,
        whatsapp,
        is_verified,
        is_active,
      } = createBusinessDto;

      const result = await this.pool.query(
        `
      INSERT INTO businesses (
        owner_id, name, description, logo, cover_image,
        location_id, business_type_id, phone, email,
        website, instagram, whatsapp, is_verified, is_active
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14
      )
      RETURNING *;
      `,
        [
          owner_id,
          name,
          description ?? null,
          logo ?? null,
          cover_image ?? null,
          location_id,
          business_type_id,
          phone ?? null,
          email ?? null,
          website ?? null,
          instagram ?? null,
          whatsapp ?? null,
          is_verified ?? false,
          is_active ?? true,
        ],
      );

      return result.rows[0] as Business;
    } catch (error) {
      console.error('Database error in BusinessService.create:', error);
      throw new InternalServerErrorException('Failed to create business');
    }
  }

  async update(
    id: string,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<Business> {
    try {
      const fields = Object.keys(updateBusinessDto);
      if (!fields.length)
        throw new InternalServerErrorException('No fields provided for update');

      const values = Object.values(updateBusinessDto).map((v) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        v === undefined ? null : v,
      );

      const setClause = fields
        .map((field, idx) => `${field} = $${idx + 1}`)
        .join(', ');

      const query = `
      UPDATE businesses
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING *;
    `;

      const result = await this.pool.query(query, [...values, id]);

      if (!result.rows.length)
        throw new NotFoundException(`Business with ID ${id} not found`);

      return result.rows[0] as Business;
    } catch (error) {
      console.error('Database error in BusinessService.update:', error);
      throw new InternalServerErrorException('Failed to update business');
    }
  }
}
