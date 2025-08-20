import {
  IsUUID,
  IsOptional,
  IsString,
  IsBoolean,
  IsNumber,
  IsArray,
} from 'class-validator';

export class CreateBeauticianDto {
  @IsUUID()
  user_id: string;

  @IsUUID()
  business_id: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsNumber()
  experience_years?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @IsOptional()
  @IsBoolean()
  is_freelancer?: boolean;

  @IsOptional()
  @IsNumber()
  rating?: number;
}
