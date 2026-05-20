import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class ReplacePropertyAmenitiesDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  propertyId!: string;

  @ApiProperty({ type: [String], format: 'uuid' })
  @IsArray()
  @IsUUID('4', { each: true })
  amenityIds!: string[];
}
