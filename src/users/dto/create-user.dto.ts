import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  IsIn,
  IsDateString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(1, 100)
  full_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  phone?: string;

  @IsString()
  @Length(6, 100)
  password: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  birth_date?: string;

  @IsOptional()
  @IsIn(['customer', 'beautician', 'admin'])
  role?: 'customer' | 'beautician' | 'admin';

  @IsOptional()
  @IsString()
  profile_picture?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
