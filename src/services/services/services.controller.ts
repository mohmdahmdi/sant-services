import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service } from './entities/service.entity';

@Controller('services')
export class ServicesController {
  constructor(private readonly service: ServicesService) {}

  @Post()
  create(@Body() dto: CreateServiceDto): Promise<Service> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<Service[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Service> {
    return this.service.findOne(id);
  }

  @Get('most-popular-categories/:limit')
  findMostPopularCategories(@Param('limit') limit: number) {
    return this.service.findMostPopularCategories(limit);
  }

  @Get('/beautician/:id')
  getServicesByBeauticianId(@Param('id') id: string) {
    return this.service.getServicesByBeauticianId(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ): Promise<Service> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }

  @Get('search/:term')
  search(@Param('term') term: string): Promise<Service[]> {
    return this.service.search(term);
  }

  @Get('services-by-business/:id')
  getServicesByBusinessId(@Param('id') businessId: string) {
    return this.service.getServicesByBusinessId(businessId);
  }
}
