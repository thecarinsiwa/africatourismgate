import { ACTIVITY_DIFFICULTY_LEVELS } from '../activities.constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateActivityDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  providerId!: string;

  @ApiProperty({ example: 'Visite du parc national' })
  @IsNotEmpty({ message: 'Le titre est obligatoire.' })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({ example: 120 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  durationMinutes?: number;

  @ApiPropertyOptional({
    enum: ACTIVITY_DIFFICULTY_LEVELS,
    example: 'moderate',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_obj, value) => value !== null)
  @IsIn([...ACTIVITY_DIFFICULTY_LEVELS])
  difficultyLevel?: (typeof ACTIVITY_DIFFICULTY_LEVELS)[number] | null;

  @ApiProperty({ example: 7500 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceCents!: number;

  @ApiProperty({ example: 'USD', default: 'USD' })
  @IsString()
  @Length(3, 3)
  currency!: string;

  @ApiPropertyOptional({ example: -4.3058, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La latitude doit être un nombre.' })
  @Min(-90)
  @Max(90)
  latitude?: number | null;

  @ApiPropertyOptional({ example: 15.3, nullable: true })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'La longitude doit être un nombre.' })
  @Min(-180)
  @Max(180)
  longitude?: number | null;
}
