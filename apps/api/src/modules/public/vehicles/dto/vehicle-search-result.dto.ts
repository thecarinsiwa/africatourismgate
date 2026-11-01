import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VehicleSearchResultDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid', description: 'Tronçon tarifé sélectionné' })
  routeId!: string;

  @ApiPropertyOptional({ example: 'CD-KIN-001', nullable: true })
  licensePlate!: string | null;

  @ApiProperty({ example: 'Economy' })
  categoryName!: string;

  @ApiPropertyOptional({ example: 'Toyota Yaris', nullable: true })
  exampleModel!: string | null;

  @ApiProperty({ example: 'Tourism Gate Rent Kinshasa' })
  agencyName!: string;

  @ApiPropertyOptional({ nullable: true })
  agencyAddress!: string | null;

  @ApiProperty({ example: 'Kinshasa' })
  departureCity!: string;

  @ApiProperty({ example: 'Lubumbashi' })
  arrivalCity!: string;

  @ApiProperty({ example: 5500, description: 'Prix fixe du tronçon' })
  priceCents!: number;

  @ApiProperty({
    example: 5500,
    description: 'Total = priceCents (tarif tronçon, pas journalier)',
  })
  totalPriceCents!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty({ format: 'date', example: '2026-08-01' })
  travelDate!: string;

  @ApiProperty({
    format: 'uuid',
    description: 'Availability slot id for checkout referenceId',
  })
  availabilitySlotId!: string;

  @ApiPropertyOptional({ nullable: true, description: 'First vehicle photo URL' })
  imageUrl!: string | null;

  /** @deprecated Use departureCity */
  @ApiPropertyOptional({ deprecated: true })
  pickupCity!: string;

  /** @deprecated Use priceCents */
  @ApiPropertyOptional({ deprecated: true })
  dailyPriceCents!: number;

  /** @deprecated Always 1 for tronçon pricing */
  @ApiPropertyOptional({ deprecated: true })
  rentalDays!: number;

  /** @deprecated Use travelDate */
  @ApiPropertyOptional({ deprecated: true })
  pickupDate!: string;

  /** @deprecated Use travelDate */
  @ApiPropertyOptional({ deprecated: true })
  returnDate!: string;
}
