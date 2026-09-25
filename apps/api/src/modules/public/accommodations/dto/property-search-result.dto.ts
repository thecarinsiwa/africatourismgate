import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PropertySearchResultDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  propertyType!: string;

  @ApiProperty({ nullable: true })
  starRating!: number | null;

  @ApiProperty()
  destinationName!: string;

  @ApiProperty()
  countryCode!: string;

  @ApiProperty({ nullable: true })
  addressLine!: string | null;

  @ApiProperty({ nullable: true })
  imageUrl!: string | null;

  @ApiProperty()
  minPriceCents!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ type: [String] })
  amenityCodes!: string[];

  @ApiPropertyOptional({ nullable: true, example: -4.3058 })
  latitude?: number | null;

  @ApiPropertyOptional({ nullable: true, example: 15.3 })
  longitude?: number | null;
}
