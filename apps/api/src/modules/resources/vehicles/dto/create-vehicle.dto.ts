import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateVehicleDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  agencyId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  categoryId!: string;

  @ApiPropertyOptional({ example: 'CD-1234-AB' })
  @IsOptional()
  @IsString()
  @MaxLength(32)
  licensePlate?: string;

  @ApiProperty({ example: 4500 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  dailyPriceCents!: number;

  @ApiProperty({ example: 'USD', default: 'USD' })
  @IsString()
  @Length(3, 3)
  currency!: string;
}
