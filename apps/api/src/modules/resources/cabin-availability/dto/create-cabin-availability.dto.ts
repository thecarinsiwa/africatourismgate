import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsUUID, Min } from 'class-validator';

export class CreateCabinAvailabilityDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  cabinId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  sailingId!: string;

  @ApiProperty({ example: 8 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  availableCount!: number;

  @ApiProperty({ example: 250000 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceCents!: number;
}
