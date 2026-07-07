import { PartialType } from '@nestjs/swagger';
import { CreateGapPageDto } from './create-gap-page.dto';

export class UpdateGapPageDto extends PartialType(CreateGapPageDto) {}
