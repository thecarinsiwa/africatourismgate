import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class VehicleDetailQueryDto {
  @ApiProperty({ format: 'date', example: '2026-08-01' })
  @IsDateString()
  pickupDate!: string;

  @ApiProperty({ format: 'date', example: '2026-08-08' })
  @IsDateString()
  returnDate!: string;
}
