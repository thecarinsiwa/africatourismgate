import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsUUID } from 'class-validator';

export class TourGuideCalendarDayQueryDto {
  @ApiProperty({ example: '2026-08-15', description: 'Jour calendrier (YYYY-MM-DD)' })
  @IsDateString()
  date!: string;

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
