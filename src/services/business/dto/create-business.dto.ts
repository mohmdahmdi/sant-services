import {
  IsString,
  IsOptional,
  IsUUID,
  IsBoolean,
  IsEmail,
} from 'class-validator';

export class CreateBusinessDto {
  @IsUUID()
  owner_id: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  cover_image?: string;

  @IsUUID()
  location_id: string;

  @IsUUID()
  business_type_id: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  whatsapp?: string;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
