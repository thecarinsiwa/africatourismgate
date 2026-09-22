import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { PublicSiteMaintenance } from '@africatourismgate/types';

export class PublicSiteMaintenanceDto implements PublicSiteMaintenance {
  @ApiProperty({
    description: 'Whether the public site is in maintenance mode',
  })
  enabled!: boolean;

  @ApiPropertyOptional({
    nullable: true,
    enum: ['fr', 'en', 'es'],
    description: 'Locale of the matched maintenance window',
  })
  locale!: PublicSiteMaintenance['locale'];

  @ApiProperty({
    description:
      'True when the matched window locale differs from the requested UI locale',
  })
  localeFallback!: boolean;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Custom maintenance page title',
  })
  title!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Custom maintenance page message',
  })
  message!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Window start datetime (ISO 8601), or null if unset',
  })
  startsAt!: string | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Planned end datetime (ISO 8601), or null if unset',
  })
  endsAt!: string | null;
}
