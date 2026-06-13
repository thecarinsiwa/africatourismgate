import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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

export class VehicleDetailDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiPropertyOptional({ example: 'CD-KIN-001', nullable: true })
  licensePlate!: string | null;

  @ApiProperty({ type: VehicleDetailAgencyDto })
  agency!: VehicleDetailAgencyDto;

  @ApiProperty({ type: VehicleDetailCategoryDto })
  category!: VehicleDetailCategoryDto;

  @ApiProperty({ format: 'date', example: '2026-08-01' })
  pickupDate!: string;

  @ApiProperty({ format: 'date', example: '2026-08-08' })
  returnDate!: string;

  @ApiProperty({ example: 7 })
  rentalDays!: number;

  @ApiProperty({ example: 5500 })
  dailyPriceCents!: number;

  @ApiProperty({
    example: 38500,
    description: 'Total rental price (rentalDays × dailyPriceCents)',
  })
  totalPriceCents!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiPropertyOptional({ type: VehicleDetailAvailabilitySlotDto, nullable: true })
  availabilitySlot!: VehicleDetailAvailabilitySlotDto | null;
}
