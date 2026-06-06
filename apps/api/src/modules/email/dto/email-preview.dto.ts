import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export const EMAIL_PREVIEW_TEMPLATES = [
  'welcome',
  'booking',
  'password_reset',
] as const;

export type EmailPreviewTemplateDto =
  (typeof EMAIL_PREVIEW_TEMPLATES)[number];

export class EmailPreviewBrandingOverrideDto {
  @ApiPropertyOptional({ example: 'Mon Agence' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  displayName?: string;

  @ApiPropertyOptional({ example: '/uploads/logo.png' })
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  logoUrl?: string;

  @ApiPropertyOptional({ example: '#0d9488' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#199a45' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  secondaryColor?: string;

  @ApiPropertyOptional({ example: '© Mon Agence' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  footerText?: string;

  @ApiPropertyOptional({ example: 'Bienvenue sur {displayName}' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  welcomeSubject?: string;

  @ApiPropertyOptional({ example: 'Confirmation — {ref}' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  bookingSubject?: string;
}

export class EmailPreviewDto {
  @ApiProperty({ enum: EMAIL_PREVIEW_TEMPLATES, example: 'welcome' })
  @IsIn(EMAIL_PREVIEW_TEMPLATES, {
    message: 'template doit être welcome, booking ou password_reset.',
  })
  template!: EmailPreviewTemplateDto;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: 'organizationId doit être un UUID valide.' })
  organizationId?: string;

  @ApiPropertyOptional({ type: EmailPreviewBrandingOverrideDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => EmailPreviewBrandingOverrideDto)
  branding?: EmailPreviewBrandingOverrideDto;
}

export class EmailPreviewResponseDto {
  @ApiProperty({ example: 'Bienvenue sur Africa Tourism Gate' })
  subject!: string;

  @ApiProperty({ description: 'HTML complet du message' })
  html!: string;

  @ApiProperty({ description: 'Version texte brut' })
  text!: string;
}
