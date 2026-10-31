import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class VehicleDetailQueryDto {
  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Tronçon à tarifer. Requis sauf si départ + arrivée sont fournis.',
  })
  @IsOptional()
  @IsUUID('4')
  routeId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  departureDestinationId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  arrivalDestinationId?: string;

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
