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
import { Geographic } from './entities/geographic.entity';
import { FindNearByDto } from './dto/findNearBy-geographic.dto';

@Controller('geographics')
export class GeographicsController {
  constructor(private readonly service: GeographicsService) {}

  @Post()
  create(@Body() dto: CreateGeographicDto): Promise<Geographic> {
    return this.service.create(dto);
  }

  @Post()
  findNearBy(@Body() dto: FindNearByDto): Promise<Geographic[]> {
    return this.service.findNearby(
      Number(dto.lat),
      Number(dto.lon),
      dto.radiusKm,
    );
  }

  @Get()
  findAll(): Promise<Geographic[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Geographic> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGeographicDto,
  ): Promise<Geographic> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }

  @Get('search/:term')
  search(@Param('term') term: string): Promise<Geographic[]> {
    return this.service.search(term);
  }
}
