import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
  ValidateNested,
} from 'class-validator';

export class BookingCheckoutRoomItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID('4')
  roomId!: string;

  @ApiProperty({ example: '2099-07-01' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ example: '2099-07-02' })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;
}

export class BookingCheckoutDto {
  @ApiProperty({ type: [BookingCheckoutRoomItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BookingCheckoutRoomItemDto)
  items!: BookingCheckoutRoomItemDto[];

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;
}
