import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateHappyCustomersStatDto {
  @ApiProperty({ example: 'Vols' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  label!: string;

  @ApiProperty({ example: 94 })
  @IsInt()
  @Min(0)
  @Max(100)
  percentValue!: number;

  @ApiProperty({ enum: ['primary', 'secondary'] })
  @IsEnum(['primary', 'secondary'])
  colorKey!: 'primary' | 'secondary';

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ enum: ['draft', 'published'] })
  @IsOptional()
  @IsEnum(['draft', 'published'])
  status?: 'draft' | 'published';

  @ApiPropertyOptional({ example: 'fr' })
  @IsOptional()
  @IsString()
  @MaxLength(5)
  locale?: string;
}
