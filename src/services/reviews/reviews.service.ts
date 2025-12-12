import {
  Injectable,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Appointment } from '../appointments/entities/appointment.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
  ) {}

  async createReview(
    userId: string,
    createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    const { appointmentId, rating, comment } = createReviewDto;

    const appointment = await this.appointmentRepo.findOne({
      where: {
        id: appointmentId,
        customer_id: userId,
        status: 'completed',
      },
      relations: ['service'],
    });

    if (!appointment) {
      throw new ForbiddenException(
        'You can only review completed appointments that belong to you.',
      );
    }

    const existingReview = await this.reviewRepo.findOne({
      where: {
        appointment: { id: appointmentId },
      },
    });

    if (existingReview) {
      throw new ConflictException(
        'You have already reviewed this appointment.',
      );
    }

    const review = this.reviewRepo.create({
      rating,
      comment,
      customer: { id: userId },
      appointment: { id: appointmentId },
    });

    return this.reviewRepo.save(review);
  }

  async getReviewsByBusiness(businessId: string): Promise<Review[]> {
    return this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.appointment', 'appointment')
      .leftJoinAndSelect('appointment.service', 'service')
      .leftJoinAndSelect('review.customer', 'customer')
      .where('service.business_id = :businessId', { businessId })
      .orderBy('review.created_at', 'DESC')
      .getMany();
  }

  async getReviewsByBeautician(beauticianId: string): Promise<Review[]> {
    return this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.appointment', 'appointment')
      .leftJoinAndSelect('review.customer', 'customer')
      .where('appointment.beautician_id = :beauticianId', { beauticianId })
      .orderBy('review.created_at', 'DESC')
      .getMany();
  }

  async getReviewsByService(serviceId: string): Promise<Review[]> {
    return this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.appointment', 'appointment')
      .leftJoinAndSelect('review.customer', 'customer')
      .where('appointment.service_id = :serviceId', { serviceId })
      .orderBy('review.created_at', 'DESC')
      .getMany();
  }
}
