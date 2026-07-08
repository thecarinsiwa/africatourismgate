import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreatePackageDto {
  @ApiProperty({ example: 'Kinshasa City Break' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MaxLength(180)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @ApiPropertyOptional({
    description: 'Cover image URL shown in package listings (admin and public site).',
  })
  @IsOptional()
  @ValidateIf((_, value) => value != null && value !== '')
  @IsString()
  @MaxLength(512)
  @IsUrl(
    { require_tld: false, protocols: ['http', 'https'] },
    { message: "L'URL de l'image de couverture doit être valide." },
  )
  coverImageUrl?: string | null;

  @ApiProperty({ example: 10, default: 0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  discountPercent!: number;

  @ApiProperty({ default: true })
  @IsBoolean()
  active!: boolean;

  @ApiPropertyOptional({
    default: false,
    description: 'Highlight this package on the marketing homepage promo banner.',
  })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiPropertyOptional({ example: 5, default: 3, description: 'Package length in calendar days (departure to return).' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(365)
  durationDays?: number;
}
