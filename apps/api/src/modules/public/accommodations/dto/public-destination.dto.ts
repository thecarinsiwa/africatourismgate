import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicDestinationDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  countryCode!: string;

  @ApiPropertyOptional({ nullable: true, type: Number })
  latitude?: number | null;

  @ApiPropertyOptional({ nullable: true, type: Number })
  longitude?: number | null;
}
