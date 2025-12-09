// beauticians.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BeauticiansService } from './beauticians.service';
import { Beautician } from './entities/beautician.entity';
import { User } from '../users/entities/user.entity';
import { Business } from '../business/entities/business.entity';
import { Service } from '../services/entities/service.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { BeauticiansController } from './beauticians.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Beautician,
      User,
      Business,
      Service,
      Appointment,
    ]),
  ],
  controllers: [BeauticiansController],
  providers: [BeauticiansService],
  exports: [BeauticiansService],
})
export class BeauticiansModule {}
