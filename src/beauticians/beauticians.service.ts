import { Injectable } from '@nestjs/common';
import { CreateBeauticianDto } from './dto/create-beautician.dto';
import { UpdateBeauticianDto } from './dto/update-beautician.dto';

@Injectable()
export class BeauticiansService {
  create(createBeauticianDto: CreateBeauticianDto) {
    return 'This action adds a new beautician';
  }

  findAll() {
    return `This action returns all beauticians`;
  }

  findOne(id: number) {
    return `This action returns a #${id} beautician`;
  }

  update(id: number, updateBeauticianDto: UpdateBeauticianDto) {
    return `This action updates a #${id} beautician`;
  }

  remove(id: number) {
    return `This action removes a #${id} beautician`;
  }
}
