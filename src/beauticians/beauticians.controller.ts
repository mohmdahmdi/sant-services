import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { BeauticiansService } from './beauticians.service';
import { CreateBeauticianDto } from './dto/create-beautician.dto';
import { UpdateBeauticianDto } from './dto/update-beautician.dto';

@Controller('beauticians')
export class BeauticiansController {
  constructor(private readonly beauticiansService: BeauticiansService) {}

  @Post()
  create(@Body() createBeauticianDto: CreateBeauticianDto) {
    return this.beauticiansService.create(createBeauticianDto);
  }

  @Get()
  findAll() {
    return this.beauticiansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.beauticiansService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBeauticianDto: UpdateBeauticianDto,
  ) {
    return this.beauticiansService.update(id, updateBeauticianDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.beauticiansService.remove(id);
  }
}
