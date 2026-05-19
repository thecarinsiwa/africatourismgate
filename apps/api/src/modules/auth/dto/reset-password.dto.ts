import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token from the email link' })
  @IsNotEmpty({ message: 'Le jeton de réinitialisation est obligatoire.' })
  @IsString({
    message: 'Le jeton de réinitialisation doit être une chaîne de caractères.',
  })
  token!: string;

  @ApiProperty({ example: 'NewSecurePass123!', minLength: 8 })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères.' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  })
  @MaxLength(128, {
    message: 'Le mot de passe ne doit pas dépasser 128 caractères.',
  })
  password!: string;
}
