import { LoginDto } from './dto/login.dto';
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() userData: CreateUserDto) {
    const user = await this.authService.register(userData);
    return user;
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    const { email, phone, password } = loginDto;
    const token = await this.authService.login(email || phone || '', password);
    return token;
  }

  //   @UseGuards(JwtAuthGuard, RolesGuard)
  //   @Roles('admin')
  //   @Post('admin-only')
  //   adminOnlyEndpoint(@Req() req) {
  //     return {
  //       message: 'You are an admin!',
  //       user: req.user,
  //     };
  //   }
}
