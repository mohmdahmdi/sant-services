import { IsString, IsNumber } from 'class-validator';

export class CreateGeographicDto {
  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsString()
  district: string;

  @IsString()
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;
}
