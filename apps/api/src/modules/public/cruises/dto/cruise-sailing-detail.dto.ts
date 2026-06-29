import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PublicGalleryImageDto } from '../../dto/public-gallery-image.dto';

export class CruiseSailingDetailPortDto {
  @ApiProperty({ example: 1 })
  dayNumber!: number;

  @ApiProperty({ example: 'CDKIN' })
  portCode!: string;

  @ApiProperty({ example: 'Kinshasa Port' })
  portName!: string;

  @ApiProperty()
  countryCode!: string;

  @ApiPropertyOptional({ nullable: true, example: '10:00:00' })
  arrivalTime!: string | null;

  @ApiPropertyOptional({ nullable: true, example: '18:00:00' })
  departureTime!: string | null;
}

export class CruiseSailingDetailCabinDto {
  @ApiProperty({
    format: 'uuid',
    description: 'Cabin availability id for checkout referenceId',
  })
  availabilityId!: string;

  @ApiProperty({ format: 'uuid' })
  cabinId!: string;

  @ApiProperty({ example: 'Standard' })
  categoryName!: string;

  @ApiProperty({ example: 2 })
  maxGuests!: number;

  @ApiProperty({ example: 245000 })
  priceCents!: number;

  @ApiProperty({ example: 8 })
  availableCount!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;
}

export class CruiseSailingDetailDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'date', example: '2026-09-15' })
  departureDate!: string;

  @ApiProperty({ format: 'date', example: '2026-09-20' })
  returnDate!: string;

  @ApiProperty({ example: 5 })
  durationNights!: number;

  @ApiProperty({ example: 'Kinshasa — Banana' })
  itineraryName!: string;

  @ApiProperty({ example: 'Congo River Spirit' })
  shipName!: string;

  @ApiProperty({ example: 'Africa River Cruises' })
  cruiseLineName!: string;

  @ApiProperty({ example: 'CDKIN' })
  sailFromPortCode!: string;

  @ApiProperty({ example: 'Kinshasa Port' })
  sailFromPortName!: string;

  @ApiProperty({ example: 'CDBNW' })
  sailToPortCode!: string;

  @ApiProperty({ example: 'Banana Port' })
  sailToPortName!: string;

  @ApiProperty({ example: 245000 })
  minPriceCents!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty({ type: [CruiseSailingDetailPortDto] })
  itineraryPorts!: CruiseSailingDetailPortDto[];

  @ApiProperty({ type: [CruiseSailingDetailCabinDto] })
  cabins!: CruiseSailingDetailCabinDto[];

  @ApiProperty({ type: [PublicGalleryImageDto] })
  images!: PublicGalleryImageDto[];
}
