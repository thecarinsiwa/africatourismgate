import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateRoomDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  propertyId!: string;

  @ApiProperty({ example: 'Standard Double' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiPropertyOptional({ example: 'standard' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  roomType?: string;

  @ApiProperty({ default: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  maxGuests!: number;

  @ApiPropertyOptional({ example: '1 double bed' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  bedConfig?: string;

  @ApiProperty({ example: 8500 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  basePriceCents!: number;

  @ApiProperty({ example: 'USD', default: 'USD' })
  @IsString()
  @Length(3, 3)
  currency!: string;
}
