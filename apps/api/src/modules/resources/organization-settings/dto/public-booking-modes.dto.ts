import { ApiProperty } from '@nestjs/swagger';
import { BOOKING_ITEM_TYPE_KEYS } from '@africatourismgate/types';
import type { BookingMode, ResolvedBookingItemTypeModes } from '@africatourismgate/types';

export class PublicBookingModesDto implements ResolvedBookingItemTypeModes {
  @ApiProperty({ enum: ['immediate', 'assisted'] })
  room!: BookingMode;

  @ApiProperty({ enum: ['immediate', 'assisted'] })
  flight_class!: BookingMode;

  @ApiProperty({ enum: ['immediate', 'assisted'] })
  vehicle!: BookingMode;

  @ApiProperty({ enum: ['immediate', 'assisted'] })
  cabin!: BookingMode;

  @ApiProperty({ enum: ['immediate', 'assisted'] })
  activity_schedule!: BookingMode;

  @ApiProperty({ enum: ['immediate', 'assisted'] })
  package!: BookingMode;
}

export const PUBLIC_BOOKING_MODE_KEYS = BOOKING_ITEM_TYPE_KEYS;
