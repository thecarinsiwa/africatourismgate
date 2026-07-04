import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class UpdateBookingVisitDatesDto {
  @ApiProperty({ example: '2026-07-20', description: 'Date de début de visite (YYYY-MM-DD)' })
  @IsString()
  @Matches(DATE_PATTERN, { message: 'startDate doit être au format YYYY-MM-DD.' })
  startDate!: string;

  @ApiPropertyOptional({ example: '2026-07-22', description: 'Date de fin (défaut : startDate)' })
  @IsOptional()
  @IsString()
  @Matches(DATE_PATTERN, { message: 'endDate doit être au format YYYY-MM-DD.' })
  endDate?: string;
}
