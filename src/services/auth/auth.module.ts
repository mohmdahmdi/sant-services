import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/services/users/users.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  providers: [AuthService, UsersService, JwtService],
  controllers: [AuthController],
})
export class AuthModule {}
