import { ApiProperty } from '@nestjs/swagger';
import { RoomAvailability } from '../../../../entities/generated';

export class BulkUpsertRoomAvailabilityResponseDto {
  @ApiProperty({ format: 'uuid' })
  roomId!: string;

  @ApiProperty({ example: '2026-05-01' })
  dateFrom!: string;

  @ApiProperty({ example: '2026-05-07' })
  dateTo!: string;

  @ApiProperty({ example: 7 })
  upsertedCount!: number;

  @ApiProperty({ type: [RoomAvailability] })
  items!: RoomAvailability[];
}
