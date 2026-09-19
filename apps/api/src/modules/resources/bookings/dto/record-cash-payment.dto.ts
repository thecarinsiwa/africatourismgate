import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class RecordCashPaymentDto {
  @ApiPropertyOptional({
    description:
      'Montant en centimes. Défaut : acompte (1er paiement si acomptes activés) ou solde restant.',
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'amountCents doit être un entier.' })
  @Min(1, { message: 'amountCents doit être au moins 1.' })
  amountCents?: number;

  @ApiPropertyOptional({ description: 'Note interne caisse (historique réservation)' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
