import { UserRole } from './entities/UserRole.entity';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { isEmail } from 'class-validator';
import { User } from './entities/user.entity';
import { CreateUserInput } from './dto/create-user.dto';
import { UpdateUserInput } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserRole)
    private roleRepository: Repository<UserRole>,
  ) {}

  async create(createUserDto: CreateUserInput) {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: createUserDto.email }, { phone: createUserDto.phone }],
    });

    if (existingUser) {
      throw new BadRequestException(
        'A user with this email or phone already exists',
      );
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash: hashedPassword,
    });

    return await this.userRepository.save(user);
  }

  async findAll() {
    try {
      return await this.userRepository.find({ relations: ['ownedBusinesses'] });
    } catch (error) {
      console.error('Database error in UsersService.findAll:', error);
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string) {
    if (!isEmail(email)) {
      throw new BadRequestException('Invalid email address');
    }
    return await this.userRepository.findOne({ where: { email } });
  }

  async findByNumber(phone: string) {
    return await this.userRepository.findOne({ where: { phone } });
  }

  async addRole(userId: string, roleName: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const role = await this.roleRepository.findOne({
      where: { name: roleName },
    });
    if (!role) {
      throw new NotFoundException(`Role "${roleName}" not found`);
    }

    if (!user.roles) user.roles = [];
    const hasRole = user.roles.some((r) => r.id === role.id);
    if (hasRole) {
      throw new BadRequestException(`User already has the role "${roleName}"`);
    }

    user.roles.push(role);
    await this.userRepository.save(user);

    return {
      userId: user.id,
      roleId: role.id,
      roleName: role.name,
    };
  }

  async getUserRoles(id: string) {
    const user = await this.userRepository.findOne({
      where: { id: id },
      relations: ['roles'],
    });

    if (!user) return [];

    return user.roles?.map((role) => ({ id: role.id, name: role.name })) || [];
  }

  async update(id: string, updateUserDto: UpdateUserInput) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    if (updateUserDto.password !== undefined) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      delete updateUserDto.password;
    }

    Object.assign(user, updateUserDto);

    try {
      return await this.userRepository.save(user);
    } catch (error) {
      console.error('Update error:', error);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async remove(id: string) {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async getTotalUsers() {
    const count = await this.userRepository.count();
    return { total_customers: count };
  }
}
