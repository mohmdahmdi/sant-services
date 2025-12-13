/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
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
  async getReviewsByBusiness(
    @Param('businessId') businessId: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.reviewService.getReviewsByBusiness(businessId, page, limit);
  }

  @Get('beautician/:beauticianId')
  getReviewsByBeautician(
    @Param('beauticianId') beauticianId: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.reviewService.getReviewsByBeautician(beauticianId, page, limit);
  }

  @Get('service/:serviceId')
  getReviewsByService(
    @Param('serviceId') serviceId: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.reviewService.getReviewsByService(serviceId, page, limit);
  }
}
