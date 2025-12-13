import {
  Injectable,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { Appointment } from '../appointments/entities/appointment.entity';
import { PaginatedResult } from '../../shared/types/types';

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

  private addRelationsAndOrder(query: SelectQueryBuilder<Review>) {
    return query
      .leftJoinAndSelect('review.appointment', 'appointment')
      .leftJoinAndSelect('appointment.service', 'service')
      .leftJoinAndSelect('review.customer', 'customer')
      .orderBy('review.created_at', 'DESC');
  }

  async getReviewsByBusiness(
    businessId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Review>> {
    const query = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoin('review.appointment', 'appointment')
      .leftJoin('appointment.service', 'service')
      .where('service.business_id = :businessId', { businessId });

    this.addRelationsAndOrder(query);

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getReviewsByBeautician(
    beauticianId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Review>> {
    const query = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoin('review.appointment', 'appointment')
      .where('appointment.beautician_id = :beauticianId', { beauticianId });

    this.addRelationsAndOrder(query);

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getReviewsByService(
    serviceId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedResult<Review>> {
    const query = this.reviewRepo
      .createQueryBuilder('review')
      .leftJoin('review.appointment', 'appointment')
      .where('appointment.service_id = :serviceId', { serviceId });

    this.addRelationsAndOrder(query);

    const [data, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
