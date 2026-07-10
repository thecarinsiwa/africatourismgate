import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

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

  @ApiPropertyOptional({ example: -4.3058 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number | null;

  @ApiPropertyOptional({ example: 15.3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number | null;
}
