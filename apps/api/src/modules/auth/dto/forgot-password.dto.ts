import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'admin@africatourismgate.local' })
  @IsNotEmpty({ message: "L'adresse e-mail est obligatoire." })
  @IsEmail({}, { message: "L'adresse e-mail doit être valide." })
  @MaxLength(255, {
    message: "L'adresse e-mail ne doit pas dépasser 255 caractères.",
  })
  email!: string;
}
