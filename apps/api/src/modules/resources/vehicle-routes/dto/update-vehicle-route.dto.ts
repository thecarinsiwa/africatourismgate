import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateVehicleRouteDto } from './create-vehicle-route.dto';

export class UpdateVehicleRouteDto extends PartialType(
  OmitType(CreateVehicleRouteDto, ['vehicleId'] as const),
) {}
