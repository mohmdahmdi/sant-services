import {
  IsOptional,
  IsString,
  IsUUID,
  IsEmail,
  Length,
  IsBoolean,
  IsDate,
  IsUrl,
} from 'class-validator';

export class Business {
  @IsUUID()
  id: string;

  @IsUUID()
  owner_id: string;

  @IsString()
  @Length(1, 100)
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrl()
  logo?: string;

  @IsOptional()
  @IsUrl()
  cover_image?: string;

  @IsOptional()
  @IsUUID()
  location_id?: string;

  @IsUUID()
  business_type_id: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
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

  @IsOptional()
  @IsDate()
  created_at?: Date;

  constructor(partial: Partial<Business>) {
    Object.assign(this, partial);
  }
}
