import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PublicGalleryImageDto } from '../../dto/public-gallery-image.dto';

export class VehicleDetailAgencyDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Tourism Gate Rent Kinshasa' })
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  address!: string | null;

  @ApiProperty({ example: 'Kinshasa' })
  city!: string;
}

export class VehicleDetailCategoryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Economy' })
  name!: string;

  @ApiPropertyOptional({ example: 'Toyota Yaris', nullable: true })
  exampleModel!: string | null;
}

export class VehicleDetailAvailabilitySlotDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  startDatetime!: string;

  @ApiProperty()
  endDatetime!: string;
}

export class VehicleDetailRouteDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'Kinshasa' })
  departureCity!: string;

  @ApiProperty({ example: 'Lubumbashi' })
  arrivalCity!: string;

  @ApiProperty({ example: 5500 })
  priceCents!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;
}

export class VehicleDetailDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiPropertyOptional({ example: 'CD-KIN-001', nullable: true })
  licensePlate!: string | null;

  @ApiProperty({ type: VehicleDetailAgencyDto })
  agency!: VehicleDetailAgencyDto;

  @ApiProperty({ type: VehicleDetailCategoryDto })
  category!: VehicleDetailCategoryDto;

  @ApiProperty({ type: VehicleDetailRouteDto })
  route!: VehicleDetailRouteDto;

  @ApiProperty({ format: 'date', example: '2026-08-01' })
  travelDate!: string;

  @ApiProperty({ example: 5500, description: 'Prix fixe du tronçon' })
  priceCents!: number;

  @ApiProperty({
    example: 5500,
    description: 'Total = priceCents (tarif tronçon)',
  })
  totalPriceCents!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiPropertyOptional({ type: VehicleDetailAvailabilitySlotDto, nullable: true })
  availabilitySlot!: VehicleDetailAvailabilitySlotDto | null;

  @ApiProperty({ type: [PublicGalleryImageDto] })
  images!: PublicGalleryImageDto[];

  /** @deprecated Use travelDate */
  @ApiPropertyOptional({ deprecated: true })
  pickupDate!: string;

  /** @deprecated Use travelDate */
  @ApiPropertyOptional({ deprecated: true })
  returnDate!: string;

  /** @deprecated Always 1 */
  @ApiPropertyOptional({ deprecated: true })
  rentalDays!: number;

  /** @deprecated Use priceCents */
  @ApiPropertyOptional({ deprecated: true })
  dailyPriceCents!: number;
}
