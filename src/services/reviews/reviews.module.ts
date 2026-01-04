import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { Appointment } from '../appointments/entities/appointment.entity';
import { ReviewService } from './reviews.service';
import { ReviewController } from './reviews.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Appointment])],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports: [ReviewService],
})
export class ReviewsModule {}
