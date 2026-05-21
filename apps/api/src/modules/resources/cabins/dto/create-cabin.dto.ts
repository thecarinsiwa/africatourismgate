import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateCabinDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  shipId!: string;

  @ApiProperty({ example: 'Suite' })
  @IsNotEmpty({ message: 'La catégorie est obligatoire.' })
  @IsString()
  @MaxLength(80)
  categoryName!: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(20)
  maxGuests!: number;

  @ApiProperty({ example: 250000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  basePriceCents!: number;

  @ApiProperty({ example: 'USD' })
  @IsNotEmpty()
  @IsString()
  @Length(3, 3)
  currency!: string;
}
