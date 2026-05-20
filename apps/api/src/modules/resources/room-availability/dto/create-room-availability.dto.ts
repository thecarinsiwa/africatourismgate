import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsUUID, Min } from 'class-validator';

export class CreateRoomAvailabilityDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  roomId!: string;

  @ApiProperty({ example: '2026-05-15' })
  @IsDateString()
  date!: string;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  availableUnits!: number;

  @ApiProperty({ example: 8500 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  priceCents!: number;
}
