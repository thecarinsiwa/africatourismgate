import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const TIERS = ['member', 'silver', 'gold', 'platinum'] as const;

export class AdminLoyaltyAccountListItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  userId!: string;

  @ApiProperty()
  userEmail!: string;

  @ApiProperty()
  userFirstName!: string;

  @ApiProperty()
  userLastName!: string;

  @ApiProperty({ example: 'ONEKEY' })
  programCode!: string;

  @ApiProperty()
  pointsBalance!: number;

  @ApiProperty({ enum: TIERS })
  tier!: (typeof TIERS)[number];

  @ApiProperty({ description: 'Dernière activité (updatedAt ou createdAt)' })
  lastActivityAt!: string;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}
