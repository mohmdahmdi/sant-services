import { IsLatitude, IsLongitude } from 'class-validator';

export class FindInBoundDto {
  @IsLatitude()
  swLat: number;

  @IsLongitude()
  swLng: number;

  @IsLatitude()
  neLat: number;

  @IsLongitude()
  neLng: number;
}
