import { ACTIVITY_DIFFICULTY_LEVELS } from '@africatourismgate/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
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
}
