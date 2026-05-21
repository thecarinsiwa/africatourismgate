import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsUUID, Min } from 'class-validator';

export class BulkUpsertFlightClassAvailabilityDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  flightClassId!: string;

  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  dateFrom!: string;

  @ApiProperty({ example: '2026-05-07' })
  @IsDateString()
  dateTo!: string;

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
