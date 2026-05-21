import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateItineraryDto } from './create-itinerary.dto';

export class UpdateItineraryDto extends PartialType(
  OmitType(CreateItineraryDto, ['shipId'] as const),
) {}
