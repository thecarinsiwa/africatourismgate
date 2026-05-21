import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

const FLIGHT_CLASS_NAMES = [
  'economy',
  'premium_economy',
  'business',
  'first',
] as const;

export class CreateFlightClassDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  flightId!: string;

  @ApiProperty({ enum: FLIGHT_CLASS_NAMES })
  @IsEnum(FLIGHT_CLASS_NAMES)
  className!: (typeof FLIGHT_CLASS_NAMES)[number];

  @ApiProperty({ example: 15000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  basePriceCents!: number;

  @ApiProperty({ example: 120 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1000)
  seatsTotal!: number;
}
