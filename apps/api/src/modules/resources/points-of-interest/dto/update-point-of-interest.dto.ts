import { OmitType, PartialType } from '@nestjs/swagger';
import { CreatePointOfInterestDto } from './create-point-of-interest.dto';

export class UpdatePointOfInterestDto extends PartialType(
  OmitType(CreatePointOfInterestDto, ['destinationId'] as const),
) {}
