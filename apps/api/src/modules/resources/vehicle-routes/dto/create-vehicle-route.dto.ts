import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsString, IsUUID, Length, MaxLength, Min } from 'class-validator';

export class CreateVehicleRouteDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  vehicleId!: string;

  @ApiProperty({ example: 'Kinshasa' })
  @IsString()
  @MaxLength(120)
  departureCity!: string;

  @ApiProperty({ example: 'Lubumbashi' })
  @IsString()
  @MaxLength(120)
  arrivalCity!: string;

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
