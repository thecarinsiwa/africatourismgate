import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@africatourismgate.local' })
  @IsNotEmpty({ message: "L'adresse e-mail est obligatoire." })
  @IsEmail({}, { message: "L'adresse e-mail doit être valide." })
  email!: string;

  @ApiProperty({ example: 'your-secure-password', minLength: 8 })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères.' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  })
  password!: string;

  @ApiPropertyOptional({
    description: 'Stable browser profile id — one active session per profile',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID('4', {
    message: "L'identifiant d'instance client doit être un UUID valide.",
  })
  clientInstanceId?: string;
}
