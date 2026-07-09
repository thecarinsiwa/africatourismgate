import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateActivityItineraryStopDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'activityId doit être un UUID valide.' })
  activityId!: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt({ message: "L'ordre doit être un entier." })
  @Min(1)
  @Max(365)
  stopOrder!: number;

  @ApiProperty({ example: 'Place de la Gare' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MaxLength(180)
  name!: string;

  @ApiProperty({ example: -4.3058 })
  @Type(() => Number)
  @IsNumber({}, { message: 'La latitude doit être un nombre.' })
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({ example: 15.3 })
  @Type(() => Number)
  @IsNumber({}, { message: 'La longitude doit être un nombre.' })
  @Min(-180)
  @Max(180)
  longitude!: number;

  @ApiPropertyOptional({ example: 'Point de départ du circuit.' })
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string | null;
}
