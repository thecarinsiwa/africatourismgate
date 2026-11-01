import { ApiProperty } from '@nestjs/swagger';
import type { PublicFooter } from '@africatourismgate/types';

export class PublicFooterDto implements PublicFooter {
  @ApiProperty({
    description: 'Tagline under the brand mark in the public site footer',
  })
  tagline!: string;

  @ApiProperty({
    description: 'Newsletter column description in the public site footer',
  })
  newsletterDesc!: string;
}
