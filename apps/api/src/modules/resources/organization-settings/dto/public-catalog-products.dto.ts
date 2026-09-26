import { ApiProperty } from '@nestjs/swagger';
import type { ResolvedCatalogProducts } from '@africatourismgate/types';

export class PublicCatalogProductsDto implements ResolvedCatalogProducts {
  @ApiProperty({ description: 'Hotels vertical enabled on the public site' })
  hotels!: boolean;

  @ApiProperty({ description: 'Flights vertical enabled on the public site' })
  flights!: boolean;

  @ApiProperty({ description: 'Cars vertical enabled on the public site' })
  cars!: boolean;

  @ApiProperty({ description: 'Cruises vertical enabled on the public site' })
  cruises!: boolean;

  @ApiProperty({ description: 'Tours / activities vertical enabled on the public site' })
  tours!: boolean;

  @ApiProperty({ description: 'Packages vertical enabled on the public site' })
  packages!: boolean;
}
