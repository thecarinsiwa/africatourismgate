import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class UnlockSessionDto {
  @ApiProperty({ example: 'your-secure-password', minLength: 8 })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères.' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  })
  password!: string;

  @ApiProperty({ description: 'JWT refresh token for the locked session' })
  @IsNotEmpty({ message: 'Le jeton de rafraîchissement est obligatoire.' })
  @IsString({
    message: 'Le jeton de rafraîchissement doit être une chaîne de caractères.',
  })
  @MinLength(1, { message: 'Le jeton de rafraîchissement est obligatoire.' })
  refreshToken!: string;
}
