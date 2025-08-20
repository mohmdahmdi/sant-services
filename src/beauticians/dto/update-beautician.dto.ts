import { PartialType } from '@nestjs/swagger';
import { CreateBeauticianDto } from './create-beautician.dto';

export class UpdateBeauticianDto extends PartialType(CreateBeauticianDto) {}
