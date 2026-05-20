import { ApiProperty } from '@nestjs/swagger';

export class PropertyAmenitiesPayloadDto {
  @ApiProperty({ format: 'uuid' })
  propertyId!: string;

  @ApiProperty({ type: [String], format: 'uuid' })
  amenityIds!: string[];
}
