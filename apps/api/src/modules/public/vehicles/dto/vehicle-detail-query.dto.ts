import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class VehicleDetailQueryDto {
  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Tronçon à tarifer. Requis sauf si départ + arrivée sont fournis.',
  })
  @IsOptional()
  @IsUUID('4')
  routeId?: string;

  @ApiPropertyOptional({ example: 'Kinshasa' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  departureCity?: string;

  @ApiPropertyOptional({ example: 'Lubumbashi' })
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  arrivalCity?: string;

  @ApiPropertyOptional({
    format: 'date',
    example: '2026-08-01',
    description: 'Date du trajet (ou pickupDate en alias legacy)',
  })
  @IsOptional()
  @IsDateString()
  travelDate?: string;

  @ApiPropertyOptional({
    format: 'date',
    deprecated: true,
    description: 'Alias legacy de travelDate',
  })
  @IsOptional()
  @IsDateString()
  pickupDate?: string;

  @ApiPropertyOptional({
    format: 'date',
    deprecated: true,
  })
  @IsOptional()
  @IsDateString()
  returnDate?: string;
}
