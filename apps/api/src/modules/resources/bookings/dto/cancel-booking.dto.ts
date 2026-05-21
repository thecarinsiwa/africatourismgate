import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelBookingDto {
  @ApiPropertyOptional({ description: 'Motif d’annulation (affiché dans l’historique)' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}
