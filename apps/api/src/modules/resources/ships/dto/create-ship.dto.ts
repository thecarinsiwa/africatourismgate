import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateShipDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  cruiseLineId!: string;

  @ApiProperty({ example: 'Congo Explorer' })
  @IsNotEmpty({ message: 'Le nom est obligatoire.' })
  @IsString()
  @MaxLength(180)
  name!: string;

  @ApiPropertyOptional({ example: 2018 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1900)
  @Max(2100)
  builtYear?: number | null;
}
