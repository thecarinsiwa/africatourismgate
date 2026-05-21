import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateCabinDto } from './create-cabin.dto';

export class UpdateCabinDto extends PartialType(
  OmitType(CreateCabinDto, ['shipId'] as const),
) {}
