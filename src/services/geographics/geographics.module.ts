import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GeographicsService } from './geographics.service';
import { Location } from './entities/location.entity';
import { Business } from '../business/entities/business.entity';
import { GeographicsController } from './geographics.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Location, Business])],
  controllers: [GeographicsController],
  providers: [GeographicsService],
  exports: [GeographicsService],
})
export class GeographicsModule {}
