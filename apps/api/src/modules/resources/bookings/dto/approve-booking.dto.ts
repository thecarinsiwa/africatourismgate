import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { AssignBookingGuideItemDto } from '../../tour-guides/dto/booking-guide-assignment.dto';
import { ApproveTravelerPricingDto } from './update-booking-pricing.dto';

export { ApproveTravelerPricingDto } from './update-booking-pricing.dto';

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
