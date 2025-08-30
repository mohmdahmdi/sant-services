import { Exclude } from 'class-transformer';
import { IsEmail, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class User {
  @IsUUID()
  id: string;

  @IsString()
  @Length(1, 100)
  full_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  phone?: string;

  @Exclude()
  password_hash: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  birth_date?: Date;

  @IsOptional()
  profile_picture?: string;

  @IsOptional()
  bio?: string;

  created_at: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
