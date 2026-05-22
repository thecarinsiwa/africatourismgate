import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateFlightClassDto } from './create-flight-class.dto';

export class UpdateFlightClassDto extends PartialType(
  OmitType(CreateFlightClassDto, ['flightId'] as const),
) {}
