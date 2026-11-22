import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsIn, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export type ForgotPasswordPortal = 'web' | 'admin';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'admin@africatourismgate.local' })
  @IsNotEmpty({ message: "L'adresse e-mail est obligatoire." })
  @IsEmail({}, { message: "L'adresse e-mail doit être valide." })
  @MaxLength(255, {
    message: "L'adresse e-mail ne doit pas dépasser 255 caractères.",
  })
  email!: string;

  /** Which app hosts the reset page linked in the email. Defaults to admin. */
  @ApiPropertyOptional({ enum: ['web', 'admin'], default: 'admin' })
  @IsOptional()
  @IsIn(['web', 'admin'], {
    message: "Le portail doit être 'web' ou 'admin'.",
  })
  portal?: ForgotPasswordPortal;
}
