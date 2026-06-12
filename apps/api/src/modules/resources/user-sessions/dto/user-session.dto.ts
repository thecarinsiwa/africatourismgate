import { ApiProperty } from '@nestjs/swagger';
import { UserSessions } from '../../../../entities/generated';

function formatTimestamp(value: string | Date | null | undefined): string | null {
  if (value == null) return null;
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

/** API response — refresh token hash is never exposed. */
export class UserSessionDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty()
  expiresAt!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ nullable: true })
  updatedAt!: string | null;
}

export function toUserSessionDto(row: UserSessions): UserSessionDto {
  return {
    id: row.id,
    userId: row.userId,
    expiresAt: formatTimestamp(row.expiresAt) ?? '',
    createdAt: formatTimestamp(row.createdAt) ?? '',
    updatedAt: formatTimestamp(row.updatedAt),
  };
}
