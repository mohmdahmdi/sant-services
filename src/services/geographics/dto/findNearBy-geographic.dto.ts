import { IsLatitude, IsLongitude, IsNumber } from 'class-validator';

export class FindNearByDto {
  @IsLatitude()
  lat: number;

  @IsLongitude()
  lon: number;

  @IsNumber()
  radiusKm: number;
}
