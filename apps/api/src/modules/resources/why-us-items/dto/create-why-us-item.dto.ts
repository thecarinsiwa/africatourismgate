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

export class CreateWhyUsItemDto {
  @ApiProperty({ example: 'Voyages Incroyables' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(160)
  title!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty({ example: '/about/who-we-are' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(512)
  linkUrl!: string;

  @ApiProperty({ enum: ['globe', 'search', 'booking', 'support'] })
  @IsEnum(['globe', 'search', 'booking', 'support'])
  iconKey!: 'globe' | 'search' | 'booking' | 'support';

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
