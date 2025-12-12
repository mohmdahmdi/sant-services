/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Controller, Post, Body, Get, Param, Req } from '@nestjs/common';
import { ReviewService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @Post()
  createReview(@Req() req, @Body() dto: CreateReviewDto) {
    const userId = req.user.id;
    return this.reviewService.createReview(userId, dto);
  }

  @Get('business/:businessId')
  getReviewsByBusiness(@Param('businessId') businessId: string) {
    return this.reviewService.getReviewsByBusiness(businessId);
  }

  @Get('beautician/:beauticianId')
  getReviewsByBeautician(@Param('beauticianId') beauticianId: string) {
    return this.reviewService.getReviewsByBeautician(beauticianId);
  }

  @Get('service/:serviceId')
  getReviewsByService(@Param('serviceId') serviceId: string) {
    return this.reviewService.getReviewsByService(serviceId);
  }
}
