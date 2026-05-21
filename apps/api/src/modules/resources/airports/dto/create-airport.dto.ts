import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAirportDto {
  @ApiProperty({ example: 'FIH' })
  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  iataCode!: string;

  @ApiProperty({ example: "N'djili International Airport" })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MaxLength(180)
  name!: string;

  @ApiProperty({ example: 'Kinshasa' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  city!: string;

  @ApiProperty({ example: 'CD' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 2)
  countryCode!: string;

  @ApiPropertyOptional({ example: -4.3858 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({ example: 15.4446 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;
}
