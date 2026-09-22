import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { OrganizationMaintenance, SiteMaintenanceLocale } from '@africatourismgate/types';
import { normalizeSiteMaintenanceLocale } from '@africatourismgate/types';
import { OrganizationMaintenances } from '../../../../entities/organization-maintenance.entity';

export class OrganizationMaintenanceDto implements OrganizationMaintenance {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty({ enum: ['fr', 'en', 'es'] })
  locale!: SiteMaintenanceLocale;

  @ApiPropertyOptional({ nullable: true })
  title!: string | null;

  @ApiPropertyOptional({ nullable: true })
  message!: string | null;

  @ApiProperty()
  enabled!: boolean;

  @ApiProperty({ description: 'ISO 8601' })
  startsAt!: string;

  @ApiPropertyOptional({ nullable: true, description: 'ISO 8601' })
  endsAt!: string | null;

  @ApiPropertyOptional({ nullable: true, format: 'uuid' })
  createdByUserId!: string | null;

  @ApiPropertyOptional({ nullable: true, format: 'uuid' })
  updatedByUserId!: string | null;

  @ApiPropertyOptional({ nullable: true, format: 'uuid' })
  deletedByUserId!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;

  @ApiPropertyOptional({ nullable: true })
  deletedAt!: string | null;
}

function toIso(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  return value instanceof Date ? value.toISOString() : String(value);
}

export function toOrganizationMaintenanceDto(
  row: OrganizationMaintenances,
): OrganizationMaintenanceDto {
  return {
    id: row.id,
    organizationId: row.organizationId,
    locale: normalizeSiteMaintenanceLocale(row.locale),
    title: row.title ?? null,
    message: row.message ?? null,
    enabled: Boolean(row.enabled),
    startsAt: toIso(row.startsAt) ?? new Date(0).toISOString(),
    endsAt: toIso(row.endsAt),
    createdByUserId: row.createdByUserId ?? null,
    updatedByUserId: row.updatedByUserId ?? null,
    deletedByUserId: row.deletedByUserId ?? null,
    createdAt: toIso(row.createdAt) ?? new Date(0).toISOString(),
    updatedAt: toIso(row.updatedAt),
    deletedAt: toIso(row.deletedAt),
  };
}
