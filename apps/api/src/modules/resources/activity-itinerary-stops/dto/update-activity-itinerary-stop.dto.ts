import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateActivityItineraryStopDto } from './create-activity-itinerary-stop.dto';

export class UpdateActivityItineraryStopDto extends PartialType(
  OmitType(CreateActivityItineraryStopDto, ['activityId'] as const),
) {}
