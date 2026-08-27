import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class SendReceiptEmailDto {
  @ApiProperty({ example: 'client@exemple.com', description: 'Destinataire du reçu' })
  @IsEmail({}, { message: 'Adresse e-mail invalide.' })
  @MaxLength(255)
  to!: string;
}
