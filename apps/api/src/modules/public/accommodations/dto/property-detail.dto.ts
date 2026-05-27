import { ApiProperty } from '@nestjs/swagger';

export class PropertyDetailImageDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty({ nullable: true })
  caption!: string | null;

  @ApiProperty()
  sortOrder!: number;
}

export class PropertyDetailAmenityDto {
  @ApiProperty()
  code!: string;

  @ApiProperty()
  name!: string;
}

export class PropertyDetailNightlyPriceDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  priceCents!: number;
}

export class PropertyDetailRoomDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  roomType!: string | null;

  @ApiProperty()
  maxGuests!: number;

  @ApiProperty({ nullable: true })
  bedConfig!: string | null;

  @ApiProperty()
  basePriceCents!: number;

  @ApiProperty()
  currency!: string;

  @ApiProperty({ nullable: true })
  totalPriceCents!: number | null;

  @ApiProperty()
  available!: boolean;

  @ApiProperty({ type: [PropertyDetailNightlyPriceDto] })
  nightlyBreakdown!: PropertyDetailNightlyPriceDto[];
}

export class PropertyDetailStayDto {
  @ApiProperty({ nullable: true })
  checkIn!: string | null;

  @ApiProperty({ nullable: true })
  checkOut!: string | null;

  @ApiProperty()
  nights!: number;

  @ApiProperty()
  guests!: number;

  @ApiProperty({ nullable: true })
  minTotalCents!: number | null;

  @ApiProperty()
  currency!: string;
}

export class PropertyCalendarDayDto {
  @ApiProperty()
  date!: string;

  @ApiProperty()
  minPriceCents!: number;

  @ApiProperty()
  available!: boolean;

  @ApiProperty()
  currency!: string;
}

export class PropertyDetailDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  slug!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty({ nullable: true })
  description!: string | null;

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

  @ApiProperty({ type: [PropertyDetailImageDto] })
  images!: PropertyDetailImageDto[];

  @ApiProperty({ type: [PropertyDetailAmenityDto] })
  amenities!: PropertyDetailAmenityDto[];

  @ApiProperty({ type: [PropertyDetailRoomDto] })
  rooms!: PropertyDetailRoomDto[];

  @ApiProperty({ type: PropertyDetailStayDto })
  stay!: PropertyDetailStayDto;

  @ApiProperty({ type: [PropertyCalendarDayDto] })
  calendarDays!: PropertyCalendarDayDto[];
}
