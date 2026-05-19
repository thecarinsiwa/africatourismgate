import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'JWT refresh token issued at login or register' })
  @IsNotEmpty({ message: 'Le jeton de rafraîchissement est obligatoire.' })
  @IsString({
    message: 'Le jeton de rafraîchissement doit être une chaîne de caractères.',
  })
  @MinLength(1, { message: 'Le jeton de rafraîchissement est obligatoire.' })
  refreshToken!: string;
}
