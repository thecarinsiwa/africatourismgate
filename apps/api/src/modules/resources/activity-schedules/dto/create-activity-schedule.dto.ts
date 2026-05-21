import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsUUID, Min } from 'class-validator';

export class CreateActivityScheduleDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  activityId!: string;

  @ApiProperty({ example: '2026-06-15T09:00:00.000Z' })
  @IsDateString()
  startDatetime!: string;

  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity!: number;
}
