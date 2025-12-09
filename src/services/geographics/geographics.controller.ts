import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { GeographicsService } from './geographics.service';
import { CreateGeographicDto } from './dto/create-geographic.dto';
import { UpdateGeographicDto } from './dto/update-geographic.dto';
import { Location } from './entities/location.entity';
import { FindNearByDto } from './dto/findNearBy-geographic.dto';
import { FindInBoundDto } from './dto/findInBound-geographic.dto';

@Controller('geographics')
export class GeographicsController {
  constructor(private readonly service: GeographicsService) {}

  @Post()
  create(@Body() dto: CreateGeographicDto): Promise<Location> {
    return this.service.create(dto);
  }

  @Post('/find-nearby')
  findNearBy(@Body() dto: FindNearByDto): Promise<Location[]> {
    return this.service.findNearby(
      Number(dto.lat),
      Number(dto.lon),
      dto.radiusKm,
    );
  }

  @Get()
  findAll(): Promise<Location[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Location> {
    return this.service.findOne(id);
  }

  @Get('business/:id')
  findLocationByBusinessId(@Param('id') businessId: string) {
    return this.service.findLocationByBusinessId(businessId);
  }
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGeographicDto,
  ): Promise<Location> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }

  @Get('search/:term')
  search(@Param('term') term: string): Promise<Location[]> {
    return this.service.search(term);
  }

  // geographic.controller.ts
  @Post('/in-bounds')
  findInBounds(@Body() dto: FindInBoundDto) {
    return this.service.findInBounds(
      Number(dto.swLat),
      Number(dto.swLng),
      Number(dto.neLat),
      Number(dto.neLng),
    );
  }
}
