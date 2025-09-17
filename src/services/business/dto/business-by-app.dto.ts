import { IsNumber } from 'class-validator';

import { IsOptional } from 'class-validator';

export class BusinessByAppointmentDto {
  @IsNumber()
  @IsOptional()
  days?: number;

  @IsNumber()
  @IsOptional()
  limit?: number;
}
