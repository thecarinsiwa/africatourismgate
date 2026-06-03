import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Organizations } from '../../../entities/generated/organizations.entity';

export class AuthOrganizationDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiPropertyOptional({ nullable: true })
  description!: string | null;

  @ApiPropertyOptional({ nullable: true })
  website!: string | null;

  @ApiPropertyOptional({ nullable: true })
  contactEmail!: string | null;

  @ApiPropertyOptional({ nullable: true })
  contactPhone!: string | null;

  @ApiPropertyOptional({ nullable: true })
  logoUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  faviconUrl!: string | null;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ enum: ['active', 'suspended', 'deleted'] })
  status!: 'active' | 'suspended' | 'deleted';

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}

export function toAuthOrganizationDto(org: Organizations): AuthOrganizationDto {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    description: org.description ?? null,
    website: org.website ?? null,
    contactEmail: org.contactEmail ?? null,
    contactPhone: org.contactPhone ?? null,
    logoUrl: org.logoUrl ?? null,
    faviconUrl: org.faviconUrl ?? null,
    currency: org.currency,
    status: org.status,
    createdAt:
      org.createdAt instanceof Date
        ? org.createdAt.toISOString()
        : String(org.createdAt),
    updatedAt: org.updatedAt
      ? org.updatedAt instanceof Date
        ? org.updatedAt.toISOString()
        : String(org.updatedAt)
      : null,
  };
}
