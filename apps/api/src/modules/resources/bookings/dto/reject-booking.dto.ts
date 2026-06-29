import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RejectBookingDto {
  @ApiPropertyOptional({ description: 'Motif du refus (historique + e-mail CE-6)' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  reason?: string;
}
