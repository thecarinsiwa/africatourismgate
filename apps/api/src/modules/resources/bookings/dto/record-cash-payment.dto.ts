import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RecordCashPaymentDto {
  @ApiPropertyOptional({ description: 'Note interne caisse (historique réservation)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
