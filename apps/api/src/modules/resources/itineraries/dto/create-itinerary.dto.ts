import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateItineraryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  shipId!: string;

  @ApiProperty({ example: 'Congo River Discovery' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MaxLength(180)
  name!: string;

  @ApiProperty({ example: 7 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  durationNights!: number;
}
