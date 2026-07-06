import { PartialType } from '@nestjs/swagger';
import { CreateWhyUsSectionDto } from './create-why-us-section.dto';

export class UpdateWhyUsSectionDto extends PartialType(CreateWhyUsSectionDto) {}
