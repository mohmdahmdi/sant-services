import {
  IsUUID,
  IsOptional,
  IsString,
  IsDateString,
  IsIn,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  customer_id: string;

  @IsUUID()
  beautician_id: string;

  @IsUUID()
  service_id: string;

  @IsDateString()
  scheduled_at: string;

  @IsOptional()
  @IsIn(['pending', 'confirmed', 'completed', 'cancelled'])
  status?: string;

  @IsOptional()
  @IsIn(['unpaid', 'paid'])
  payment_status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
