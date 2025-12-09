// business.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessService } from './business.service';
import { Business } from './entities/business.entity';
import { Location } from '../geographics/entities/location.entity';
import { BusinessType } from './entities/business-type.entity';
import { Service } from '../services/entities/service.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { BusinessController } from './business.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Business,
      Location,
      BusinessType,
      Service,
      Appointment,
    ]),
  ],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
