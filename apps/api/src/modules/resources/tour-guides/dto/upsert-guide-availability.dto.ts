import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsIn } from 'class-validator';

export class UpsertGuideAvailabilityDto {
  @ApiProperty({ example: '2026-08-15' })
  @IsDateString()
  date!: string;

  @ApiProperty({ enum: ['available', 'unavailable'] })
  @IsIn(['available', 'unavailable'])
  status!: 'available' | 'unavailable';
}
