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
} from 'class-validator';

export class CreateHeroSlideDto {
  @ApiProperty({ example: 'Safari de 7 jours' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  subtitle!: string;

  @ApiProperty({ example: 'MASAI MARA MAGIQUE' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description!: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(1024)
  @IsUrl(
    { require_tld: false, protocols: ['http', 'https'] },
    { message: "L'URL de l'image doit être valide." },
  )
  imageUrl!: string;

  @ApiProperty({ example: 'Coucher de soleil sur la savane' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  imageAlt!: string;

  @ApiPropertyOptional({ example: '/hotels?destination=Masai%20Mara' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  href?: string | null;

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
