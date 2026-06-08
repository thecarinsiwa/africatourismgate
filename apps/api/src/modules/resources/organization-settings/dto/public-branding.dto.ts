import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicBrandingDto {
  @ApiProperty({ example: 'Africa Tourism Gate' })
  displayName!: string;

  @ApiProperty({ example: '#0B6E4F' })
  primaryColor!: string;

  @ApiProperty({ example: '#199a45' })
  secondaryColor!: string;

  @ApiPropertyOptional({ nullable: true })
  logoUrl!: string | null;

  @ApiPropertyOptional({ nullable: true })
  faviconUrl!: string | null;
}
