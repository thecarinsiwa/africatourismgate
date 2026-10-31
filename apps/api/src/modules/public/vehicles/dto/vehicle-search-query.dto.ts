import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class VehicleSearchQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Destination de départ (tronçon)',
  })
  @IsOptional()
  @IsUUID('4')
  departureDestinationId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Destination d’arrivée (tronçon)',
  })
  @IsOptional()
  @IsUUID('4')
  arrivalDestinationId?: string;

  @ApiPropertyOptional({
    example: 'Kinshasa',
    description: 'Nom partiel de la destination de départ (si pas d’id)',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(180)
  departureLocation?: string;

  @ApiPropertyOptional({
    example: 'Lubumbashi',
    description: 'Nom partiel de la destination d’arrivée (si pas d’id)',
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
