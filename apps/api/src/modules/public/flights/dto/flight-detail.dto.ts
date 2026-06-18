import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PublicGalleryImageDto } from '../../dto/public-gallery-image.dto';

export class FlightDetailClassDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ enum: ['economy', 'premium_economy', 'business', 'first'] })
  className!: string;

  @ApiProperty()
  priceCents!: number;

  @ApiProperty()
  availableSeats!: number;

  @ApiProperty()
  totalPriceCents!: number;
}

export class FlightDetailAirportDto {
  @ApiProperty({ example: 'FIH' })
  iataCode!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  city!: string;

  @ApiProperty()
  countryCode!: string;
}

export class FlightDetailDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'KQ550' })
  flightNumber!: string;

  @ApiProperty()
  airlineName!: string;

  @ApiProperty({ example: 'KQ' })
  airlineIataCode!: string;

  @ApiProperty({ type: FlightDetailAirportDto })
  departureAirport!: FlightDetailAirportDto;

  @ApiProperty({ type: FlightDetailAirportDto })
  arrivalAirport!: FlightDetailAirportDto;

  @ApiProperty()
  departureTime!: string;

  @ApiProperty()
  arrivalTime!: string;

  @ApiProperty()
  durationMinutes!: number;

  @ApiProperty()
  departureDate!: string;

  @ApiPropertyOptional({ nullable: true })
  returnDate!: string | null;

  @ApiProperty()
  passengers!: number;

  @ApiProperty()
  minPriceCents!: number;

  @ApiProperty({ example: 'USD' })
  currency!: string;

  @ApiProperty({ type: [FlightDetailClassDto] })
  classes!: FlightDetailClassDto[];

  @ApiProperty({ type: [PublicGalleryImageDto] })
  images!: PublicGalleryImageDto[];
}
