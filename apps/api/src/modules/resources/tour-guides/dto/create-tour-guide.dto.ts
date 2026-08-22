import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateTourGuideDto {
  @ApiProperty({ enum: ['internal', 'external'] })
  @IsEnum(['internal', 'external'], {
    message: 'Le type doit être internal ou external.',
  })
  type!: 'internal' | 'external';

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Obligatoire pour un guide interne',
  })
  @ValidateIf((dto: CreateTourGuideDto) => dto.type === 'internal')
  @IsNotEmpty({ message: "L'utilisateur est obligatoire pour un guide interne." })
  @IsUUID('4', { message: "L'identifiant utilisateur doit être un UUID valide." })
  userId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: "L'identifiant d'organisation doit être un UUID valide." })
  organizationId?: string;

  @ApiProperty({ example: 'Marie Kabila', maxLength: 180 })
  @IsNotEmpty({ message: 'Le nom affiché est obligatoire.' })
  @IsString()
  @MaxLength(180)
  displayName!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ maxLength: 512 })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  photoUrl?: string;

  @ApiPropertyOptional({
    example: 'guide@example.com',
    maxLength: 255,
    description: 'Obligatoire pour un guide externe',
  })
  @ValidateIf((dto: CreateTourGuideDto) => dto.type === 'external')
  @IsNotEmpty({ message: "L'e-mail de contact est obligatoire pour un guide externe." })
  @IsEmail({}, { message: "L'adresse e-mail de contact doit être valide." })
  @MaxLength(255)
  contactEmail?: string;

  @ApiProperty({ type: [String], example: ['fr', 'en'] })
  @IsArray({ message: 'Les langues doivent être un tableau.' })
  @ArrayMinSize(1, { message: 'Au moins une langue est requise.' })
  @IsString({ each: true })
  languages!: string[];

  @ApiProperty({
    type: [String],
    description: 'Identifiants de destinations couvertes',
  })
  @IsArray({ message: 'Les destinations doivent être un tableau.' })
  @IsUUID('4', { each: true, message: 'Chaque destination doit être un UUID valide.' })
  destinations!: string[];

  @ApiPropertyOptional({ enum: ['active', 'inactive'], default: 'active' })
  @IsOptional()
  @IsEnum(['active', 'inactive'], {
    message: 'Le statut doit être active ou inactive.',
  })
  status?: 'active' | 'inactive';
}
