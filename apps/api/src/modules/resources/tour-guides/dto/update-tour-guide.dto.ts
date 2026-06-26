import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class UpdateTourGuideDto {
  @ApiPropertyOptional({ enum: ['internal', 'external'] })
  @IsOptional()
  @IsEnum(['internal', 'external'], {
    message: 'Le type doit être internal ou external.',
  })
  type?: 'internal' | 'external';

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4', { message: "L'identifiant utilisateur doit être un UUID valide." })
  userId?: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4', { message: "L'identifiant d'organisation doit être un UUID valide." })
  organizationId?: string | null;

  @ApiPropertyOptional({ maxLength: 180 })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  displayName?: string;

  @ApiPropertyOptional({ nullable: true })
  @IsOptional()
  @IsString()
  bio?: string | null;

  @ApiPropertyOptional({ maxLength: 512, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  photoUrl?: string | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1, { message: 'Au moins une langue est requise.' })
  @IsString({ each: true })
  languages?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  destinations?: string[];

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsOptional()
  @IsEnum(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
