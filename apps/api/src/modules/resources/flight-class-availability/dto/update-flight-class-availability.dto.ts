import { PartialType, PickType } from '@nestjs/swagger';
import { CreateFlightClassAvailabilityDto } from './create-flight-class-availability.dto';

export class UpdateFlightClassAvailabilityDto extends PartialType(
  PickType(CreateFlightClassAvailabilityDto, ['availableSeats', 'priceCents'] as const),
) {}
