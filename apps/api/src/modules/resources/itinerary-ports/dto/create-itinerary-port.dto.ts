import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  Min,
} from 'class-validator';

export class CreateItineraryPortDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  itineraryId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  portId!: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  dayNumber!: number;

  @ApiPropertyOptional({ example: '08:00:00' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  arrivalTime?: string | null;

  @ApiPropertyOptional({ example: '18:00:00' })
  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}(:\d{2})?$/)
  departureTime?: string | null;
}
