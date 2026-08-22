import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import type { Promotions } from '../../../../entities/generated';

export class CreatePromotionDto {
  @ApiProperty({ example: 'Soldes été — Afrique de l’Est' })
  @IsNotEmpty({ message: 'Le titre est obligatoire.' })
  @IsString()
  @MaxLength(180)
  name!: string;

  @ApiPropertyOptional({
    description:
      'Texte libre (ex. destination ou produit ciblé) — le schéma ne stocke pas encore de cible structurée.',
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({
    description: 'URL de la photo de couverture (upload ou URL externe).',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  coverImageUrl?: string | null;

  @ApiPropertyOptional({ enum: ['percent', 'fixed_amount'], nullable: true })
  @IsOptional()
  @IsIn(['percent', 'fixed_amount'])
  discountType?: Promotions['discountType'];

  @ApiPropertyOptional({
    example: 15,
    description: 'Requis si discountType est renseigné',
    nullable: true,
  })
  @ValidateIf((o: CreatePromotionDto) => o.discountType != null)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  discountValue?: number | null;

  @ApiPropertyOptional({ example: '2026-06-01', nullable: true })
  @IsOptional()
  @IsDateString()
  validFrom?: string | null;

  @ApiPropertyOptional({ example: '2026-08-31', nullable: true })
  @IsOptional()
  @IsDateString()
  validUntil?: string | null;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxRedemptions?: number | null;

  @ApiProperty({ example: 1 })
  @IsInt()
  @IsIn([0, 1])
  active!: number;
}
