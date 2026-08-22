import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TourGuides, Users } from '../../../../entities/generated';

export class TourGuideUserSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  firstName!: string;

  @ApiProperty()
  lastName!: string;
}

export class TourGuideDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ enum: ['internal', 'external'] })
  type!: 'internal' | 'external';

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  userId!: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  organizationId!: string | null;

  @ApiProperty()
  displayName!: string;

  @ApiPropertyOptional({ nullable: true })
  bio!: string | null;

  @ApiPropertyOptional({ nullable: true })
  photoUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  contactEmail!: string | null;

  @ApiProperty({ type: [String] })
  languages!: string[];

  @ApiProperty({ type: [String], description: 'Destination ids' })
  destinations!: string[];

  @ApiProperty({ enum: ['active', 'inactive'] })
  status!: 'active' | 'inactive';

  @ApiPropertyOptional({ type: TourGuideUserSummaryDto })
  user?: TourGuideUserSummaryDto;

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

export function toTourGuideUserSummary(user: Users): TourGuideUserSummaryDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  };
}

export function toTourGuideDto(
  guide: TourGuides,
  user?: Users | null,
): TourGuideDto {
  return {
    id: guide.id,
    type: guide.type,
    userId: guide.userId ?? null,
    organizationId: guide.organizationId ?? null,
    displayName: guide.displayName,
    bio: guide.bio ?? null,
    photoUrl: guide.photoUrl ?? null,
    contactEmail: guide.contactEmail ?? null,
    languages: Array.isArray(guide.languages) ? guide.languages : [],
    destinations: Array.isArray(guide.destinations) ? guide.destinations : [],
    status: guide.status,
    ...(user ? { user: toTourGuideUserSummary(user) } : {}),
    createdAt: formatTimestamp(guide.createdAt) ?? '',
    updatedAt: formatTimestamp(guide.updatedAt),
  };
}
