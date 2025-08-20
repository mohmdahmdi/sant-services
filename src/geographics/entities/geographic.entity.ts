import { IsNumber, IsString } from 'class-validator';

export class Geographic {
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

  constructor(partial: Partial<Geographic>) {
    Object.assign(this, partial);
  }
}
