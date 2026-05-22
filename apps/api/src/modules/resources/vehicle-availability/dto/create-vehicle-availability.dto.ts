import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator';

const STATUSES = ['available', 'maintenance', 'rented'] as const;

export class CreateVehicleAvailabilityDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  vehicleId!: string;

  @ApiProperty({ example: '2026-06-01T08:00:00.000Z' })
  @IsDateString()
  startDatetime!: string;

  @ApiProperty({ example: '2026-06-07T18:00:00.000Z' })
  @IsDateString()
  endDatetime!: string;

  @ApiPropertyOptional({ enum: STATUSES, default: 'available' })
  @IsOptional()
  @IsEnum(STATUSES)
  status?: (typeof STATUSES)[number];
}
