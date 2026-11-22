import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export const VEHICLE_TRIP_STATUSES = [
  'open',
  'payment_closed',
  'completed',
  'cancelled',
] as const;

export class VehicleTripsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  routeId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  vehicleId?: string;

  @ApiPropertyOptional({ example: '2026-11-20', description: 'YYYY-MM-DD' })
  @IsOptional()
  @IsDateString()
  travelDate?: string;

  @ApiPropertyOptional({ enum: VEHICLE_TRIP_STATUSES })
  @IsOptional()
  @IsIn(VEHICLE_TRIP_STATUSES)
  status?: (typeof VEHICLE_TRIP_STATUSES)[number];
}

export class CreateVehicleTripDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  vehicleId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  routeId!: string;

  @ApiProperty({
    example: '2026-11-20T08:30:00.000Z',
    description: 'Departure datetime (ISO 8601)',
  })
  @IsDateString()
  departureDatetime!: string;

  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  seats?: number;
}

export class JoinVehicleTripDto {
  @ApiPropertyOptional({ example: 1, default: 1, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  seats?: number;
}

export class UpdateVehicleTripDto {
  @ApiProperty({
    example: '2026-11-20T09:00:00.000Z',
    description: 'New departure datetime (ISO 8601)',
  })
  @IsDateString()
  departureDatetime!: string;
}

export class VehicleTripDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  vehicleId!: string;

  @ApiProperty()
  routeId!: string;

  @ApiProperty()
  availabilityId!: string;

  @ApiProperty()
  departureDatetime!: string;

  @ApiProperty({ nullable: true })
  createdByUserId!: string | null;

  @ApiProperty()
  maxCapacity!: number;

  @ApiProperty()
  seatsReserved!: number;

  @ApiProperty()
  seatsRemaining!: number;

  @ApiProperty({ enum: VEHICLE_TRIP_STATUSES })
  status!: (typeof VEHICLE_TRIP_STATUSES)[number];

  @ApiProperty({ description: 'Per-person price for current headcount' })
  priceCentsPerPerson!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty()
  departureCity!: string;

  @ApiProperty()
  arrivalCity!: string;

  @ApiProperty({ description: 'ISO datetime when join/payment close' })
  paymentClosesAt!: string;

  @ApiProperty()
  canJoin!: boolean;

  @ApiProperty({
    description: 'True when the authenticated viewer created this trip',
  })
  isMine!: boolean;

  @ApiProperty()
  canEditDeparture!: boolean;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ nullable: true })
  updatedAt!: string | null;
}
