import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateVehicleRouteDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  vehicleId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  departureDestinationId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  arrivalDestinationId!: string;

  @ApiProperty({ example: 5500 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceCents!: number;

  @ApiProperty({ example: 'USD', default: 'USD' })
  @IsString()
  @Length(3, 3)
  currency!: string;
}
