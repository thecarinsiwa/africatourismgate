import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateGapImpactStatDto {
  @ApiProperty({ example: 'Participants sensibilisés' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  label!: string;

  @ApiProperty({ example: '2 500+' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(64)
  valueDisplay!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | null;

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
