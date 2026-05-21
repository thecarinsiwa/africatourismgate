import { ApiProperty } from '@nestjs/swagger';
import { FlightClassAvailability } from '../../../../entities/generated';

export class BulkUpsertFlightClassAvailabilityResponseDto {
  @ApiProperty({ format: 'uuid' })
  flightClassId!: string;

  @ApiProperty({ example: '2026-05-01' })
  dateFrom!: string;

  @ApiProperty({ example: '2026-05-07' })
  dateTo!: string;

  @ApiProperty({ example: 7 })
  upsertedCount!: number;

  @ApiProperty({ type: [FlightClassAvailability] })
  items!: FlightClassAvailability[];
}
