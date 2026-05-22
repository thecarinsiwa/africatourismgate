import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsUUID, Min } from 'class-validator';

export class CreateFlightClassAvailabilityDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  flightClassId!: string;

  @ApiProperty({ example: '2026-05-15' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  availableSeats!: number;

  @ApiProperty({ example: 15000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceCents!: number;
}
