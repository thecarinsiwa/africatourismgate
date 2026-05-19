import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsNotEmpty({ message: "L'adresse e-mail est obligatoire." })
  @IsEmail({}, { message: "L'adresse e-mail doit être valide." })
  @MaxLength(255)
  email!: string;

  @ApiProperty({ example: 'SecurePass123!', minLength: 8 })
  @IsNotEmpty({ message: 'Le mot de passe est obligatoire.' })
  @IsString()
  @MinLength(8, {
    message: 'Le mot de passe doit contenir au moins 8 caractères.',
  })
  @MaxLength(128)
  password!: string;

  @ApiProperty({ example: 'Jane' })
  @IsNotEmpty({ message: 'Le prénom est obligatoire.' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  lastName!: string;

  @ApiPropertyOptional({ example: '+33612345678' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  phone?: string;

  @ApiPropertyOptional({ example: 'fr', maxLength: 2 })
  @IsOptional()
  @IsString()
  @MaxLength(2)
  preferredLanguage?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: "L'identifiant d'organisation doit être un UUID valide." })
  organizationId?: string;

  @ApiPropertyOptional({ enum: ['active', 'suspended'], default: 'active' })
  @IsOptional()
  @IsEnum(['active', 'suspended'], {
    message: 'Le statut doit être active ou suspended.',
  })
  status?: 'active' | 'suspended';
}
