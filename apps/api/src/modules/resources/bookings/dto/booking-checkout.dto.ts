import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import type { BookingItems } from '../../../../entities/generated';

export const BOOKING_CHECKOUT_ITEM_TYPES = [
  'room',
  'flight_class',
  'vehicle',
  'cabin',
  'activity_schedule',
] as const satisfies readonly BookingItems['itemType'][];

export type BookingCheckoutItemType = (typeof BOOKING_CHECKOUT_ITEM_TYPES)[number];

export class BookingCheckoutItemDto {
  @ApiProperty({ enum: BOOKING_CHECKOUT_ITEM_TYPES })
  @IsIn(BOOKING_CHECKOUT_ITEM_TYPES)
  itemType!: BookingCheckoutItemType;

  @ApiProperty({
    description:
      'room: roomId | flight_class: flightClassId | vehicle/cabin: availability row id | activity_schedule: schedule id',
    format: 'uuid',
  })
  @IsUUID('4')
  referenceId!: string;

  @ApiProperty({ example: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiPropertyOptional({ example: '2099-07-01', description: 'Required for room (start of stay)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2099-07-02', description: 'Required for room (end of stay)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: '2099-08-01', description: 'Required for flight_class' })
  @IsOptional()
  @IsDateString()
  date?: string;
}

export class BookingCheckoutDto {
  @ApiProperty({ type: [BookingCheckoutItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BookingCheckoutItemDto)
  items!: BookingCheckoutItemDto[];

  @ApiPropertyOptional({ example: 'USD', default: 'USD' })
  @IsOptional()
  @IsString()
  @Length(3, 3)
  currency?: string;

  @ApiPropertyOptional({ example: 'SUMMER20', description: 'Promo code (case-insensitive)' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  promoCode?: string;

  @ApiPropertyOptional({ format: 'uuid', description: 'Active promotion with discount rules' })
  @IsOptional()
  @IsUUID('4')
  promotionId?: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description:
      'Client final de la réservation (réservé au personnel avec users.read, ex. caisse POS)',
  })
  @IsOptional()
  @IsUUID('4')
  customerUserId?: string;
}
