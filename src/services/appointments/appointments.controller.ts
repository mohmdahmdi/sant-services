// src/appointments/appointments.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Appointment } from './entities/appointment.entity';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly service: AppointmentsService) {}

  @Post()
  create(@Body() dto: CreateAppointmentDto): Promise<Appointment> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<Appointment[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Appointment> {
    return this.service.findOne(id);
  }

  @Get('/customer/:id')
  getAppointmentsByCustomerId(@Param('id') customerId: string) {
    return this.service.getAppointmentsByCustomerId(customerId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateAppointmentDto,
  ): Promise<Appointment> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }

  @Get('search/:term')
  search(@Param('term') term: string): Promise<Appointment[]> {
    return this.service.search(term);
  }
}
