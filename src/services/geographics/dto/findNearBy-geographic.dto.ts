import { IsLatitude, IsLongitude, IsNumber, IsOptional } from 'class-validator';

export class FindNearByDto {
  @IsLatitude()
  lat: number;

  @IsLongitude()
  lon: number;

  @IsOptional()
  @IsNumber()
  radiusKm?: number;
}
