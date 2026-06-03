import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Jane' })
  @IsOptional()
  @IsString({ message: 'Le prénom doit être une chaîne de caractères.' })
  @MinLength(1, { message: 'Le prénom est obligatoire.' })
  @MaxLength(100, {
    message: 'Le prénom ne doit pas dépasser 100 caractères.',
  })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString({ message: 'Le nom doit être une chaîne de caractères.' })
  @MinLength(1, { message: 'Le nom est obligatoire.' })
  @MaxLength(100, { message: 'Le nom ne doit pas dépasser 100 caractères.' })
  lastName?: string;

  @ApiPropertyOptional({ example: '+33612345678' })
  @IsOptional()
  @IsString({ message: 'Le téléphone doit être une chaîne de caractères.' })
  @MaxLength(32, {
    message: 'Le téléphone ne doit pas dépasser 32 caractères.',
  })
  phone?: string | null;

  @ApiPropertyOptional({ example: 'fr', maxLength: 2 })
  @IsOptional()
  @IsString({
    message: 'La langue préférée doit être une chaîne de caractères.',
  })
  @MaxLength(2, {
    message: 'La langue préférée ne doit pas dépasser 2 caractères.',
  })
  preferredLanguage?: string | null;
}
