import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesService } from './services.service';
import { Service } from './entities/service.entity';
import { ServiceCategory } from './entities/service-category.entity';
import { Business } from '../business/entities/business.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { Beautician } from '../beauticians/entities/beautician.entity';
import { ServicesController } from './services.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Service,
      ServiceCategory,
      Business,
      Appointment,
      Beautician,
    ]),
  ],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
