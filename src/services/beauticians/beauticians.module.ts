import { Module } from '@nestjs/common';
import { BeauticiansService } from './beauticians.service';
import { BeauticiansController } from './beauticians.controller';

@Module({
  controllers: [BeauticiansController],
  providers: [BeauticiansService],
})
export class BeauticiansModule {}
