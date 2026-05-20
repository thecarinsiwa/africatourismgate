import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePointOfInterestDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'destinationId doit être un UUID valide.' })
  destinationId!: string;

  @ApiProperty({ example: 'Gombe (city centre)' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MaxLength(180)
  name!: string;

  @ApiPropertyOptional({ example: -4.3058 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La latitude doit être un nombre.' })
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 15.3 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La longitude doit être un nombre.' })
  @Min(-180)
  @Max(180)
  longitude?: number;
}
