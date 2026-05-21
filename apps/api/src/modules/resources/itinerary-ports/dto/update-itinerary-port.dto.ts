import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateItineraryPortDto } from './create-itinerary-port.dto';

export class UpdateItineraryPortDto extends PartialType(
  OmitType(CreateItineraryPortDto, ['itineraryId'] as const),
) {}
