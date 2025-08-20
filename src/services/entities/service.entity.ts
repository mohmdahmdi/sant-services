import {
  IsUUID,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
} from 'class-validator';

export class Service {
  @IsUUID()
  id: string;

  @IsUUID()
  business_id: string;

  @IsUUID()
  category_id: string;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsNumber()
  duration_minutes: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsIn(['male', 'female', 'all'])
  gender_target: string;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
