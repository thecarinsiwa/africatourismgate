import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PublicAuthVisualIcon } from '@africatourismgate/types';

export class PublicAuthVisualIconDto implements PublicAuthVisualIcon {
  @ApiProperty({ example: 'pin', enum: ['pin', 'compass', 'globe', 'star', 'custom'] })
  preset!: PublicAuthVisualIcon['preset'];

  @ApiPropertyOptional({ nullable: true })
  imageUrl!: string | null;

  @ApiProperty({ example: 25, minimum: 0, maximum: 100 })
  opacity!: number;

  @ApiProperty({ example: 'lg', enum: ['sm', 'md', 'lg'] })
  size!: PublicAuthVisualIcon['size'];

  @ApiProperty({
    example: 'bottom-right',
    enum: ['bottom-right', 'top-right', 'bottom-left', 'top-left'],
  })
  position!: PublicAuthVisualIcon['position'];

  @ApiProperty({ example: true })
  enabled!: boolean;
}

export class PublicAuthVisualDto {
  @ApiProperty({ type: [PublicAuthVisualIconDto] })
  icons!: PublicAuthVisualIconDto[];
}

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

  @ApiPropertyOptional({ type: PublicAuthVisualDto })
  authVisual?: PublicAuthVisualDto;
}
