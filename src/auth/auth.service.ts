import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(userData: CreateUserDto) {
    const user = await this.usersService.create(userData);
    return new User(user);
  }

  async validateUserByEmail(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async validateUserByNumber(number: string, password: string) {
    const user = await this.usersService.findByNumber(number);
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password_hash, ...result } = user;
      return result;
    }
    return null;
  }

  async loginByNumber(number: string, password: string) {
    const user = await this.validateUserByNumber(number, password);
    if (!user) throw new UnauthorizedException();

    const payload = {
      sub: user.id,
      number: user.phone,
      roles: this.usersService.getUserRolesByNumber(number),
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async loginByEmail(email: string, password: string) {
    const user = await this.validateUserByEmail(email, password);
    if (!user) throw new UnauthorizedException();

    const payload = {
      sub: user.id,
      email: user.phone,
      roles: this.usersService.getUserRolesByNumber(email),
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
