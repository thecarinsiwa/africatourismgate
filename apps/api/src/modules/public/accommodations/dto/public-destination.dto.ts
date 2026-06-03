import { ApiProperty } from '@nestjs/swagger';

export class PublicDestinationDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  countryCode!: string;
}
