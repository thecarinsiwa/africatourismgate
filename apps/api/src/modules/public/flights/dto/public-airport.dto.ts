import { ApiProperty } from '@nestjs/swagger';

export class PublicAirportDto {
  @ApiProperty({ example: 'FIH' })
  iataCode!: string;

  @ApiProperty({ example: "N'djili International Airport" })
  name!: string;

  @ApiProperty({ example: 'Kinshasa' })
  city!: string;

  @ApiProperty({ example: 'CD' })
  countryCode!: string;
}
