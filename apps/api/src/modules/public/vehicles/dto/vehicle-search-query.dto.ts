import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class VehicleSearchQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    example: 'Kinshasa',
    description: 'Ville / lieu de départ (texte libre, correspondance partielle)',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(180)
  departureLocation?: string;

  @ApiPropertyOptional({
    example: 'Lubumbashi',
    description: 'Ville / lieu d’arrivée (texte libre, correspondance partielle)',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(180)
  arrivalLocation?: string;

  @ApiPropertyOptional({
    example: 'Kinshasa',
    description: 'Alias legacy de departureLocation',
    deprecated: true,
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(180)
  pickupLocation?: string;

  @ApiPropertyOptional({
    format: 'date',
    example: '2026-08-01',
    description: 'Date du trajet. Si omise, utilise la disponibilité la plus proche.',
  })
  @IsOptional()
  @IsDateString()
  travelDate?: string;

  @ApiPropertyOptional({
    format: 'date',
    example: '2026-08-01',
    description: 'Alias legacy de travelDate',
    deprecated: true,
  })
  @IsOptional()
  @IsDateString()
  pickupDate?: string;

  @ApiPropertyOptional({
    format: 'date',
    example: '2026-08-08',
    description: 'Ignoré pour la tarification tronçon (conservé pour compatibilité client)',
    deprecated: true,
  })
  @IsOptional()
  @IsDateString()
  returnDate?: string;
}
