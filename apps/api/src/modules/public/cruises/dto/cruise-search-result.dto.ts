import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CruiseSearchResultDto {
  @ApiProperty({ format: 'uuid', description: 'Sailing id' })
  id!: string;

  @ApiProperty({ format: 'date', example: '2026-09-15' })
  departureDate!: string;

  @ApiProperty({ format: 'date', example: '2026-09-20' })
  returnDate!: string;

  @ApiProperty({ example: 'Kinshasa — Banana' })
  itineraryName!: string;

  @ApiProperty({ example: 'Congo River Spirit' })
  shipName!: string;

  @ApiProperty({ example: 'Africa River Cruises' })
  cruiseLineName!: string;

  @ApiProperty({ example: 'CDKIN' })
  sailFromPortCode!: string;

  @ApiProperty({ example: 'Kinshasa Port' })
  sailFromPortName!: string;

  @ApiProperty({ example: 'CDBNW' })
  sailToPortCode!: string;

  @ApiProperty({ example: 'Banana Port' })
  sailToPortName!: string;

  @ApiProperty({ example: 5 })
  durationNights!: number;

  @ApiProperty({ example: 245000 })
  minPriceCents!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiPropertyOptional({ nullable: true, description: 'First ship photo URL' })
  imageUrl!: string | null;
}
