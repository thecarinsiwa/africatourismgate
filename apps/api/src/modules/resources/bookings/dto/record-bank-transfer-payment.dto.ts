import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RecordBankTransferPaymentDto {
  @ApiPropertyOptional({
    description: 'Note interne staff (preuve / référence virement)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
