import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsUUID } from 'class-validator';

export class CreateCruiseSailingDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  itineraryId!: string;

  @ApiProperty({ example: '2026-09-01' })
  @IsDateString()
  departureDate!: string;
}
