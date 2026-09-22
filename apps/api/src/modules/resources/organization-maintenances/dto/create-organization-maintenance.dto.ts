import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { SITE_MAINTENANCE_LOCALES } from '@africatourismgate/types';

export class CreateOrganizationMaintenanceDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: 'organizationId doit être un UUID valide.' })
  organizationId?: string;

  @ApiPropertyOptional({ enum: SITE_MAINTENANCE_LOCALES, default: 'fr' })
  @IsOptional()
  @IsIn([...SITE_MAINTENANCE_LOCALES], {
    message: 'locale doit être fr, en ou es.',
  })
  locale?: string;

  @ApiPropertyOptional({ nullable: true, maxLength: 200 })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  @MaxLength(200)
  title?: string | null;

  @ApiPropertyOptional({ nullable: true, maxLength: 2000 })
  @IsOptional()
  @ValidateIf((_, v) => v != null)
  @IsString()
  @MaxLength(2000)
  message?: string | null;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({
    description: 'Début de la fenêtre de maintenance (ISO 8601)',
    example: '2026-09-23T08:00:00.000Z',
  })
  @IsDateString({}, { message: 'startsAt doit être une date ISO 8601 valide.' })
  startsAt!: string;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Fin prévue (ISO 8601), ou null si indéterminée',
  })
  @IsOptional()
  @ValidateIf((_, v) => v != null && v !== '')
  @IsDateString({}, { message: 'endsAt doit être une date ISO 8601 valide.' })
  endsAt?: string | null;
}
