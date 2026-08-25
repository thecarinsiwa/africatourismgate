import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID, Matches } from 'class-validator';

export class TourGuideCalendarSummaryQueryDto {
  @ApiProperty({ example: '2026-08', description: 'Mois calendrier (YYYY-MM)' })
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, {
    message: 'month doit être au format YYYY-MM.',
  })
  month!: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filtrer par destination couverte' })
  @IsOptional()
  @IsUUID('4')
  destinationId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filtrer par organisation' })
  @IsOptional()
  @IsUUID('4')
  organizationId?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Filtrer par guide (vue fiche)' })
  @IsOptional()
  @IsUUID('4')
  guideId?: string;
}
