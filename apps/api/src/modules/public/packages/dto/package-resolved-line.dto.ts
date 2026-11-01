import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PackageResolvedLineDto {
  @ApiProperty({
    enum: ['property', 'flight', 'vehicle', 'cruise', 'activity', 'troncon'],
  })
  lineType!: 'property' | 'flight' | 'vehicle' | 'cruise' | 'activity' | 'troncon';

  @ApiProperty({ format: 'uuid' })
  itemId!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  scheduleId?: string;

  @ApiPropertyOptional({ format: 'date' })
  date?: string;

  @ApiPropertyOptional()
  participants?: number;

  @ApiPropertyOptional({ format: 'uuid' })
  roomId?: string;

  @ApiPropertyOptional({ format: 'date' })
  checkIn?: string;

  @ApiPropertyOptional({ format: 'date' })
  checkOut?: string;

  @ApiPropertyOptional()
  guests?: number;

  @ApiPropertyOptional({ format: 'uuid' })
  flightClassId?: string;

  @ApiPropertyOptional({ format: 'date' })
  departureDate?: string;

  @ApiPropertyOptional()
  passengers?: number;

  @ApiPropertyOptional({ format: 'uuid' })
  availabilitySlotId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'vehicle_routes id' })
  routeId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'vehicles id (vehicle / tronçon lines)',
  })
  vehicleId?: string;

  @ApiPropertyOptional({ format: 'date' })
  travelDate?: string;

  @ApiPropertyOptional({ format: 'date' })
  pickupDate?: string;

  @ApiPropertyOptional({ format: 'date' })
  returnDate?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  sailingId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  cabinAvailabilityId?: string;
}
