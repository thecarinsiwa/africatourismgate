import { ApiProperty } from '@nestjs/swagger';

export class DestinationRelatedCountsDto {
  @ApiProperty({ description: 'Properties linked to this destination' })
  properties!: number;

  @ApiProperty({ description: 'Activities whose provider belongs to this destination' })
  activities!: number;

  @ApiProperty({
    description: 'Packages including at least one property or activity from this destination',
  })
  packages!: number;
}
