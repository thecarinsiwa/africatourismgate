import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
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

  @ApiProperty({ example: 'USD', default: 'USD' })
  @IsString()
  @Length(3, 3)
  currency!: string;
}
