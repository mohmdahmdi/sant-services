// src/beauticians/beauticians.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { BeauticiansService } from './beauticians.service';
import { CreateBeauticianDto } from './dto/create-beautician.dto';
import { UpdateBeauticianDto } from './dto/update-beautician.dto';
import { Beautician } from './entities/beautician.entity';

@Controller('beauticians')
export class BeauticiansController {
  constructor(private readonly service: BeauticiansService) {}

  @Post()
  create(@Body() dto: CreateBeauticianDto): Promise<Beautician> {
    return this.service.create(dto);
  }

  @Get()
  findAll(): Promise<Beautician[]> {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Beautician> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBeauticianDto,
  ): Promise<Beautician> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.service.remove(id);
  }

  @Get('search/:term')
  search(@Param('term') term: string): Promise<Beautician[]> {
    return this.service.search(term);
  }
}
