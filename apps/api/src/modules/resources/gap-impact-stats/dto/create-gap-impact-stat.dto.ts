import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateIf,
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

  @ApiPropertyOptional({ description: 'Optional illustrative image URL' })
  @IsOptional()
  @ValidateIf((_, value) => value != null && value !== '')
  @IsString()
  @MaxLength(1024)
  @IsUrl(
    { require_tld: false, protocols: ['http', 'https'] },
    { message: "L'URL de l'image doit être valide." },
  )
  imageUrl?: string | null;

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
