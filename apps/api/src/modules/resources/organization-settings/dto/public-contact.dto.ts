import { ApiPropertyOptional } from '@nestjs/swagger';

export class PublicContactDto {
  @ApiPropertyOptional({ example: '+243 815 000 000', nullable: true })
  phone!: string | null;

  @ApiPropertyOptional({ example: 'support@africatourismgate.com', nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ example: 'Kinshasa, RD Congo', nullable: true })
  location!: string | null;

  @ApiPropertyOptional({ nullable: true })
  facebookUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  twitterUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  instagramUrl!: string | null;
}
