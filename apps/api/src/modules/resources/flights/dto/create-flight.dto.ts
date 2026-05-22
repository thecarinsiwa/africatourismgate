import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateFlightDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  airlineId!: string;

  @ApiProperty({ example: 'ET302' })
  @IsNotEmpty({ message: 'Le numéro de vol est obligatoire.' })
  @IsString()
  @MaxLength(20)
  flightNumber!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  departureAirportId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  arrivalAirportId!: string;

  @ApiProperty({ example: '2026-06-01T08:00:00.000Z' })
  @IsDateString()
  departureTime!: string;

  @ApiProperty({ example: '2026-06-01T14:30:00.000Z' })
  @IsDateString()
  arrivalTime!: string;

  @ApiProperty({ example: 390 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(24 * 60)
  durationMinutes!: number;
}
