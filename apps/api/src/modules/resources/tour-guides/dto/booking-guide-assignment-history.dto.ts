import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingGuideAssignmentHistory } from '../../../../entities/generated';

export class BookingGuideAssignmentHistorySnapshotDto {
  @ApiProperty({ format: 'uuid' })
  bookingId!: string;

  @ApiProperty({ format: 'uuid' })
  guideId!: string;

  @ApiProperty({ enum: ['primary', 'secondary'] })
  role!: 'primary' | 'secondary';

  @ApiProperty()
  startDatetime!: string;

  @ApiProperty()
  endDatetime!: string;

  @ApiPropertyOptional({ nullable: true })
  notes!: string | null;
}

export class BookingGuideAssignmentHistoryItemDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  assignmentId!: string;

  @ApiProperty({ format: 'uuid' })
  bookingId!: string;

  @ApiProperty({ format: 'uuid' })
  guideId!: string;

  @ApiProperty({ enum: ['created', 'updated', 'deleted'] })
  action!: BookingGuideAssignmentHistory['action'];

  @ApiProperty({ type: BookingGuideAssignmentHistorySnapshotDto })
  snapshot!: BookingGuideAssignmentHistorySnapshotDto;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  actorUserId!: string | null;

  @ApiPropertyOptional({ nullable: true })
  actorDisplayName!: string | null;

  @ApiPropertyOptional({ nullable: true })
  guideDisplayName!: string | null;

  @ApiProperty()
  createdAt!: string;
}

function formatTimestamp(value: string | Date | null | undefined): string {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

function parseSnapshot(
  raw: Record<string, unknown>,
  row: BookingGuideAssignmentHistory,
): BookingGuideAssignmentHistorySnapshotDto {
  const role = raw.role === 'secondary' ? 'secondary' : 'primary';
  return {
    bookingId: String(raw.bookingId ?? row.bookingId),
    guideId: String(raw.guideId ?? row.guideId),
    role,
    startDatetime: formatTimestamp(raw.startDatetime as string | Date | null | undefined),
    endDatetime: formatTimestamp(raw.endDatetime as string | Date | null | undefined),
    notes: raw.notes == null ? null : String(raw.notes),
  };
}

export function toBookingGuideAssignmentHistoryItemDto(
  row: BookingGuideAssignmentHistory,
  extras?: { guideDisplayName?: string | null; actorDisplayName?: string | null },
): BookingGuideAssignmentHistoryItemDto {
  const snapshot = parseSnapshot(row.snapshot ?? {}, row);
  return {
    id: row.id,
    assignmentId: row.assignmentId,
    bookingId: row.bookingId,
    guideId: row.guideId,
    action: row.action,
    snapshot,
    actorUserId: row.actorUserId ?? null,
    actorDisplayName: extras?.actorDisplayName ?? null,
    guideDisplayName: extras?.guideDisplayName ?? null,
    createdAt: formatTimestamp(row.createdAt),
  };
}
