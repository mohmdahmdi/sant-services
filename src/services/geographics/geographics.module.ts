import { Module } from '@nestjs/common';
import { GeographicsService } from './geographics.service';
import { GeographicsController } from './geographics.controller';

@Module({
  controllers: [GeographicsController],
  providers: [GeographicsService],
})
export class GeographicsModule {}
