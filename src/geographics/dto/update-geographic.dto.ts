import { PartialType } from '@nestjs/swagger';
import { CreateGeographicDto } from './create-geographic.dto';

export class UpdateGeographicDto extends PartialType(CreateGeographicDto) {}
