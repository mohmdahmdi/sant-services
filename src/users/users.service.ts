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
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}
  async create(createUserDto: CreateUserDto) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const exist = await this.findByEmail(createUserDto.email);
      if (exist) {
        throw new BadRequestException('a user exist with this information');
      }

      const result = await this.pool.query(
        `
        INSERT INTO users (full_name, email, phone, password_hash, gender, birth_date, role, profile_picture, bio)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
        `,
        [
          createUserDto.full_name,
          createUserDto.email,
          createUserDto.phone ?? null,
          hashedPassword,
          createUserDto.gender ?? null,
          createUserDto.birth_date ?? null,
          createUserDto.role ?? 'customer',
          createUserDto.profile_picture ?? null,
          createUserDto.bio ?? null,
        ],
      );

      return new User(result.rows[0] as User);
    } catch (error) {
      console.error('Database error in UsersService.create', error);
      throw new InternalServerErrorException('Failed to create user');
    }
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
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return plainToInstance(User, result.rows[0], {
      excludeExtraneousValues: true,
    });
  }

  async findByNumber(number: string) {
    try {
      const result = await this.pool.query(
        `SELECT * FROM users WHERE phone = $1`,
        [number],
      );

      if (!result.rows.length) {
        throw new NotFoundException(`User with number ${number} not found`);
      }

      return plainToInstance(User, result.rows[0], {
        excludeExtraneousValues: true,
      });
    } catch (error) {
      console.error('Database error in UsersService.findByNumber:', error);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async addRole(userId: string, roleName: string) {
    const roleRes: QueryResult<{ id: number; name: string }> =
      await this.pool.query(`SELECT id FROM roles WHERE name = $1 LIMIT 1`, [
        roleName,
      ]);
    if (!roleRes.rows.length) {
      throw new Error(`Role ${roleName} not found`);
    }
    const roleId = roleRes.rows[0].id;

    await this.pool.query(
      `INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [userId, roleId],
    );

    return { userId, role: roleName };
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
      WHERE u.number = $1;
    `,
      [identifier],
    );
    return roles.rows.map((row) => row.name);
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
