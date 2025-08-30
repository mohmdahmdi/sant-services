import { PartialType } from '@nestjs/mapped-types';
import { CreateBeauticianDto } from './create-beautician.dto';

export class UpdateBeauticianDto extends PartialType(CreateBeauticianDto) {}
