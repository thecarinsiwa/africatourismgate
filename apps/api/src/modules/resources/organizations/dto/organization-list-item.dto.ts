import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { Organizations } from '../../../../entities/generated';

export class OrganizationListItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  slug!: string;

  @ApiPropertyOptional({ nullable: true })
  logoUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  legalForm!: string | null;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ enum: ['active', 'suspended', 'deleted'] })
  status!: Organizations['status'];

  @ApiProperty()
  createdAt!: string;

  @ApiProperty({ minimum: 0 })
  userCount!: number;

  @ApiProperty({ minimum: 0 })
  employeeCount!: number;
}
