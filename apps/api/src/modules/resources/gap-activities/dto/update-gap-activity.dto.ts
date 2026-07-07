import { PartialType } from '@nestjs/swagger';
import { CreateGapActivityDto } from './create-gap-activity.dto';

export class UpdateGapActivityDto extends PartialType(CreateGapActivityDto) {}
