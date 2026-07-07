import { PartialType } from '@nestjs/swagger';
import { CreateGapImpactStatDto } from './create-gap-impact-stat.dto';

export class UpdateGapImpactStatDto extends PartialType(CreateGapImpactStatDto) {}
