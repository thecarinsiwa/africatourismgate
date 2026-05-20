import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrganizationSettings } from '../../../../entities/generated';

export class OrganizationSettingDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty({ example: 'general' })
  settingGroup!: string;

  @ApiProperty({ example: 'locale' })
  settingKey!: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  settingValue!: Record<string, unknown>;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}

export function toOrganizationSettingDto(
  row: OrganizationSettings,
): OrganizationSettingDto {
  return {
    id: row.id,
    organizationId: row.organizationId,
    settingGroup: row.settingGroup,
    settingKey: row.settingKey,
    settingValue: row.settingValue,
    createdAt:
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt),
    updatedAt: row.updatedAt
      ? row.updatedAt instanceof Date
        ? row.updatedAt.toISOString()
        : String(row.updatedAt)
      : null,
  };
}
