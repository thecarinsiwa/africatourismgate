import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePropertyImageDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  propertyId!: string;

  @ApiProperty({ example: 'https://example.com/hotel.jpg' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(512)
  @IsUrl({}, { message: "L'URL de l'image doit être valide." })
  url!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  caption?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
