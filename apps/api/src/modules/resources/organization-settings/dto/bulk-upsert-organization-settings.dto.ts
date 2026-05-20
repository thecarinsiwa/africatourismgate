import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class UpsertOrganizationSettingItemDto {
  @ApiProperty({ example: 'general' })
  @IsNotEmpty({ message: 'settingGroup est obligatoire.' })
  @IsString()
  @MaxLength(50)
  settingGroup!: string;

  @ApiProperty({ example: 'locale' })
  @IsNotEmpty({ message: 'settingKey est obligatoire.' })
  @IsString()
  @MaxLength(100)
  settingKey!: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject({ message: 'settingValue doit être un objet JSON.' })
  settingValue!: Record<string, unknown>;
}

export class BulkUpsertOrganizationSettingsDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: 'organizationId doit être un UUID valide.' })
  organizationId?: string;

  @ApiProperty({ type: [UpsertOrganizationSettingItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertOrganizationSettingItemDto)
  settings!: UpsertOrganizationSettingItemDto[];
}
