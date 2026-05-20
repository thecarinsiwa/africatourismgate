import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Roles } from '../../../../entities/generated';

export class RoleDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiProperty()
  isSystem!: boolean;

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

export function toRoleDto(role: Roles): RoleDto {
  return {
    id: role.id,
    code: role.code,
    name: role.name,
    description: role.description ?? null,
    isSystem: Boolean(role.isSystem),
    createdAt: formatTimestamp(role.createdAt) ?? '',
    updatedAt: formatTimestamp(role.updatedAt),
  };
}
