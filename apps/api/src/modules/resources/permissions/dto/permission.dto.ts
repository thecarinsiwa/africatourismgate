import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Permissions } from '../../../../entities/generated';

export class PermissionDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  resource!: string;

  @ApiProperty()
  action!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}

function formatTimestamp(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function toPermissionDto(permission: Permissions): PermissionDto {
  return {
    id: permission.id,
    code: permission.code,
    resource: permission.resource,
    action: permission.action,
    description: permission.description ?? null,
    createdAt: formatTimestamp(permission.createdAt) ?? '',
    updatedAt: formatTimestamp(permission.updatedAt),
  };
}
