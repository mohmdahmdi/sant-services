import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { UsersService } from '../users/users.service';
import { BeauticiansService } from '../beauticians/beauticians.service';
import { BusinessService } from '../business/business.service';
import { ServicesService } from '../services/services.service';
import { AppointmentsService } from '../appointments/appointments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../users/entities/UserRole.entity';
import { Business } from '../business/entities/business.entity';
import { Beautician } from '../beauticians/entities/beautician.entity';
import { Service } from '../services/entities/service.entity';
import { Appointment } from '../appointments/entities/appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      UserRole,
      Business,
      Beautician,
      Service,
      Appointment,
    ]),
  ],
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
