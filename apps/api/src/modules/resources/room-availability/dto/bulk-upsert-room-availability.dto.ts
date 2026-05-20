import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsUUID, Min } from 'class-validator';

export class BulkUpsertRoomAvailabilityDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  roomId!: string;

  @ApiProperty({ example: '2026-05-01' })
  @IsDateString()
  dateFrom!: string;

  @ApiProperty({ example: '2026-05-07' })
  @IsDateString()
  dateTo!: string;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  availableUnits!: number;

  @ApiProperty({ example: 8500 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceCents!: number;
}
