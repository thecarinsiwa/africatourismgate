import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsOptional, ValidateIf } from 'class-validator';

export class UpsertGuideAvailabilityDto {
  @ApiPropertyOptional({
    example: '2026-08-15',
    description: 'Journée entière (legacy) — ignoré si startDatetime/endDatetime sont fournis.',
  })
  @ValidateIf((dto: UpsertGuideAvailabilityDto) => !dto.startDatetime && !dto.endDatetime)
  @IsDateString()
  date?: string;

  @ApiPropertyOptional({ description: 'Début de la plage (ISO 8601)' })
  @ValidateIf((dto: UpsertGuideAvailabilityDto) => !dto.date)
  @IsDateString()
  startDatetime?: string;

  @ApiPropertyOptional({ description: 'Fin de la plage (ISO 8601)' })
  @ValidateIf((dto: UpsertGuideAvailabilityDto) => !dto.date)
  @IsDateString()
  endDatetime?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Identifiant du créneau indisponible à mettre à jour',
  })
  @IsOptional()
  availabilityId?: string;

  @ApiProperty({ enum: ['available', 'unavailable'] })
  @IsIn(['available', 'unavailable'])
  status!: 'available' | 'unavailable';
}
