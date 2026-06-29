import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VehicleSearchResultDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

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
  pickupCity!: string;

  @ApiProperty({ example: 5500 })
  dailyPriceCents!: number;

  @ApiProperty({
    example: 38500,
    description: 'Total rental price (rentalDays × dailyPriceCents)',
  })
  totalPriceCents!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty({ example: 7 })
  rentalDays!: number;

  @ApiProperty({ format: 'date', example: '2026-08-01' })
  pickupDate!: string;

  @ApiProperty({ format: 'date', example: '2026-08-08' })
  returnDate!: string;

  @ApiProperty({
    format: 'uuid',
    description: 'Availability slot id for checkout referenceId',
  })
  availabilitySlotId!: string;

  @ApiPropertyOptional({ nullable: true, description: 'First vehicle photo URL' })
  imageUrl!: string | null;
}
