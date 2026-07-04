import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { AssignBookingGuideItemDto } from '../../tour-guides/dto/booking-guide-assignment.dto';
import { ApproveTravelerPricingDto } from './update-booking-pricing.dto';

export { ApproveTravelerPricingDto } from './update-booking-pricing.dto';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class ApproveBookingDto {
  @ApiPropertyOptional({
    description: 'Montant ajusté en centimes (remplace total_cents)',
    example: 8500,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  totalCents?: number;

  @ApiPropertyOptional({
    type: [ApproveTravelerPricingDto],
    description: 'Voyageurs et tarifs par personne (création ou mise à jour du manifeste)',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApproveTravelerPricingDto)
  travelers?: ApproveTravelerPricingDto[];

  @ApiPropertyOptional({ example: '2026-07-20', description: 'Date de début de visite' })
  @IsOptional()
  @IsString()
  @Matches(DATE_PATTERN, { message: 'visitStartDate doit être au format YYYY-MM-DD.' })
  visitStartDate?: string;

  @ApiPropertyOptional({ example: '2026-07-22', description: 'Date de fin de visite' })
  @IsOptional()
  @IsString()
  @Matches(DATE_PATTERN, { message: 'visitEndDate doit être au format YYYY-MM-DD.' })
  visitEndDate?: string;

  @ApiPropertyOptional({ description: 'Commentaire enregistré dans l’historique' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;

  @ApiPropertyOptional({
    type: [AssignBookingGuideItemDto],
    description: 'Guides à assigner lors de l’approbation',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignBookingGuideItemDto)
  guides?: AssignBookingGuideItemDto[];
}
