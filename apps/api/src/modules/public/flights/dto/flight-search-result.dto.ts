import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FlightSearchResultDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'KQ550' })
  flightNumber!: string;

  @ApiProperty()
  airlineName!: string;

  @ApiProperty({ example: 'KQ' })
  airlineIataCode!: string;

  @ApiProperty({ example: 'FIH' })
  departureAirportIata!: string;

  @ApiProperty({ example: 'Kinshasa' })
  departureAirportCity!: string;

  @ApiProperty({ example: 'NBO' })
  arrivalAirportIata!: string;

  @ApiProperty({ example: 'Nairobi' })
  arrivalAirportCity!: string;

  @ApiProperty()
  departureTime!: string;

  @ApiProperty()
  arrivalTime!: string;

  @ApiProperty()
  durationMinutes!: number;

  @ApiProperty()
  minPriceCents!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty()
  roundTrip!: boolean;

  @ApiPropertyOptional({
    format: 'date',
    description: 'Travel date used for pricing (especially when departureDate was not in the search query)',
  })
  departureDate?: string;

  @ApiPropertyOptional({ nullable: true, description: 'First flight photo URL' })
  imageUrl!: string | null;
}
