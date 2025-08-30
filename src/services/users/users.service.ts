import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Pool, QueryResult } from 'pg';
import { User } from './entities/user.entity';
import { validate as isUUID } from 'uuid';
import * as bcrypt from 'bcrypt';
import { isEmail } from 'class-validator';

@Injectable()
export class UsersService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}
  async create(createUserDto: CreateUserDto) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const exist = await this.findByEmail(createUserDto.email);
    if (exist) {
      throw new BadRequestException('a user exist with this information');
    }

    const result = await this.pool.query(
      `
        INSERT INTO users (full_name, email, phone, password_hash, gender, birth_date, profile_picture, bio)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
      [
        createUserDto.full_name,
        createUserDto.email,
        createUserDto.phone ?? null,
        hashedPassword,
        createUserDto.gender ?? null,
        createUserDto.birth_date ?? null,
        createUserDto.profile_picture ?? null,
        createUserDto.bio ?? null,
      ],
    );

    return new User(result.rows[0] as User);
  }

  async findAll() {
    try {
      const result = await this.pool.query(`
        SELECT *
        FROM users
      `);
      return result.rows as User[];
    } catch (error) {
      console.error('Database error in UsersService.findAll:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOne(id: string) {
    // Validate ID format
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid user ID');
    }

    try {
      const result = await this.pool.query(
        `SELECT * FROM users WHERE id = $1`,
        [id],
      );

      if (!result.rows.length) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return new User(result.rows[0] as User);
    } catch (error) {
      console.error('Database error in UsersService.findOne:', error);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async findByEmail(email: string) {
    if (!isEmail(email)) {
      throw new BadRequestException('Invalid email address');
    }

    const result = await this.pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email],
    );

    if (!result.rows.length) {
      return null;
    }

    return new User(result.rows[0] as User);
  }

  async findByNumber(number: string) {
    try {
      const result = await this.pool.query(
        `SELECT * FROM users WHERE phone = $1`,
        [number],
      );

      if (!result.rows.length) {
        return null;
      }

      return new User(result.rows[0] as User);
    } catch (error) {
      console.error('Database error in UsersService.findByNumber:', error);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async addRole(userId: string, roleName: string) {
    const userRes: QueryResult<{ id: string }> = await this.pool.query(
      `SELECT id FROM users WHERE id = $1 LIMIT 1`,
      [userId],
    );
    if (!userRes.rows.length) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const roleRes: QueryResult<{ id: string; name: string }> =
      await this.pool.query(
        `SELECT id, name FROM roles WHERE name = $1 LIMIT 1`,
        [roleName],
      );
    if (!roleRes.rows.length) {
      throw new NotFoundException(`Role "${roleName}" not found`);
    }
    const roleId = roleRes.rows[0].id;

    const result = await this.pool.query(
      `
    INSERT INTO user_roles (user_id, role_id) 
    VALUES ($1, $2) 
    ON CONFLICT DO NOTHING
    RETURNING user_id, role_id
    `,
      [userId, roleId],
    );

    if (!result.rows.length) {
      throw new BadRequestException(`User already has the role "${roleName}"`);
    }

    return {
      userId,
      roleId,
      roleName,
    };
  }

  async getUserRoles(identifier: string) {
    if (isEmail(identifier)) {
      const roles: QueryResult<{ name: string }> = await this.pool.query(
        `
      SELECT r.name
      FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      JOIN users u ON ur.user_id = u.id
      WHERE u.email = $1;
    `,
        [identifier],
      );
      return roles.rows.map((row) => row.name);
    }
    const roles: QueryResult<{ name: string }> = await this.pool.query(
      `
      SELECT r.name
      FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      JOIN users u ON ur.user_id = u.id
      WHERE u.phone = $1;
    `,
      [identifier],
    );
    return roles.rows.map((row) => row.name);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      // Filter out undefined fields
      const fields = Object.keys(updateUserDto).filter(
        (key) => updateUserDto[key] !== undefined,
      );

      if (fields.length === 0) {
        throw new InternalServerErrorException('No fields provided for update');
      }

      const values: any[] = [];

      for (const field of fields) {
        if (field === 'password') {
          const hashed = await bcrypt.hash(updateUserDto.password!, 10);
          values.push(hashed);
        } else {
          values.push(updateUserDto[field]);
        }
      }

      const setClause = fields
        .map((field, index) =>
          field === 'password'
            ? `password_hash = $${index + 1}`
            : `${field} = $${index + 1}`,
        )
        .join(', ');

      const query = `
      UPDATE users
      SET ${setClause}
      WHERE id = $${fields.length + 1}
      RETURNING *;
    `;

      const result = await this.pool.query(query, [...values, id]);

      if (result.rows.length === 0) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }

      return result.rows[0] as User;
    } catch (error: any) {
      console.error('Database error in UsersService.update:', error);

      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: string) {
    try {
      const result = await this.pool.query(`DELETE FROM users WHERE id = $1`, [
        id,
      ]);

      if (result.rowCount === 0) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
    } catch (error) {
      console.error('Database error in UsersService.remove:', error);
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  async getTotalUsers() {
    const data = await this.pool.query<{ total_customers: number }>(
      `SELECT COUNT(*) AS total_customers FROM Users;`,
    );

    return data.rows[0];
  }
}
