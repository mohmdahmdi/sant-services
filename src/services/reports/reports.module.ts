import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { UsersService } from '../users/users.service';
import { BeauticiansService } from '../beauticians/beauticians.service';
import { BusinessService } from '../business/business.service';
import { ServicesService } from '../services/services.service';
import { AppointmentsService } from '../appointments/appointments.service';

@Module({
  providers: [
    ReportsService,
    UsersService,
    BeauticiansService,
    BusinessService,
    ServicesService,
    AppointmentsService,
  ],
  controllers: [ReportsController],
})
export class ReportsModule {}
