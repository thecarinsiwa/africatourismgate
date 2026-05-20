import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  SLUG_PATTERN,
  SLUG_VALIDATION_MESSAGE,
} from '../../../../common/constants/slug';

const PROPERTY_TYPES = [
  'hotel',
  'resort',
  'apartment',
  'villa',
  'hostel',
  'other',
] as const;

export class CreatePropertyDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  destinationId!: string;

  @ApiProperty({ example: 'Tourism Gate Demo Hotel' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'tourism-gate-demo-hotel' })
  @IsNotEmpty({ message: 'Le slug est obligatoire.' })
  @IsString()
  @MaxLength(255)
  @Matches(SLUG_PATTERN, { message: SLUG_VALIDATION_MESSAGE })
  slug!: string;

  @ApiProperty({ enum: PROPERTY_TYPES, default: 'hotel' })
  @IsEnum(PROPERTY_TYPES, { message: 'Type de propriété invalide.' })
  propertyType!: (typeof PROPERTY_TYPES)[number];

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  starRating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  addressLine?: string;
}
