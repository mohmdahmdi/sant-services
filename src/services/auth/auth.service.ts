import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from 'src/services/users/dto/create-user.dto';
import { User } from 'src/services/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { isEmail } from 'class-validator';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(userData: CreateUserDto) {
    const user = await this.usersService.create(userData);

    const payload = {
      sub: user.id,
      identifier: user.email || user.phone,
      roles: ['user'],
    };

    const access_token = this.jwtService.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '1h',
    });

    return {
      user,
      access_token,
    };
  }

  async validateUser(identifier: string, password: string) {
    let user: User | null;
    if (isEmail(identifier)) {
      user = await this.usersService.findByEmail(identifier);
    } else {
      user = await this.usersService.findByNumber(identifier);
    }
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(identifier: string, password: string) {
    const user = await this.validateUser(identifier, password);
    if (!user) throw new UnauthorizedException();

    const roles = await this.usersService.getUserRoles(user.id);

    const payload = {
      sub: user.id,
      identifier,
      roles,
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: '1h',
      }),
    };
  }
}
