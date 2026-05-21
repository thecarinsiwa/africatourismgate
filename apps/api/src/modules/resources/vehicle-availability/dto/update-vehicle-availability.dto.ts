import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateVehicleAvailabilityDto } from './create-vehicle-availability.dto';

export class UpdateVehicleAvailabilityDto extends PartialType(
  OmitType(CreateVehicleAvailabilityDto, ['vehicleId'] as const),
) {}
