import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsNotEmpty({ message: "L'adresse e-mail est obligatoire." })
  @IsEmail({}, { message: "L'adresse e-mail doit être valide." })
  @MaxLength(255, {
    message: "L'adresse e-mail ne doit pas dépasser 255 caractères.",
  })
  email!: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères.' })
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  })
  @MaxLength(128, {
    message: 'Le mot de passe ne doit pas dépasser 128 caractères.',
  })
  password!: string;

  @ApiProperty({ example: 'Jane' })
  @IsNotEmpty({ message: 'Le prénom est obligatoire.' })
  @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
  @MinLength(1, { message: 'Le prénom est obligatoire.' })
  @MaxLength(100, {
    message: 'Le prénom ne doit pas dépasser 100 caractères.',
  })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  @MinLength(1, { message: 'Le nom est obligatoire.' })
  @MaxLength(100, { message: 'Le nom ne doit pas dépasser 100 caractères.' })
  lastName!: string;

  @ApiPropertyOptional({ example: '+33612345678' })
  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères.' })
  @MaxLength(32, {
    message: 'Le téléphone ne doit pas dépasser 32 caractères.',
  })
  phone?: string;

  @ApiPropertyOptional({ example: 'fr', maxLength: 2 })
  @IsOptional()
  @IsString({
    message: 'La langue préférée doit être une chaîne de caractères.',
  })
  @MaxLength(2, {
    message: 'La langue préférée ne doit pas dépasser 2 caractères.',
  })
  preferredLanguage?: string;

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
