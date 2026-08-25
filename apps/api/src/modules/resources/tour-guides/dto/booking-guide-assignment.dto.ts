import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { BookingGuideAssignments } from '../../../../entities/generated';

export class AssignBookingGuideItemDto {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty()
  @IsUUID('4', { message: "L'identifiant du guide doit être un UUID valide." })
  guideId!: string;

  @ApiPropertyOptional({ enum: ['primary', 'secondary'], default: 'primary' })
  @IsOptional()
  @IsEnum(['primary', 'secondary'], {
    message: 'Le rôle doit être primary ou secondary.',
  })
  role?: 'primary' | 'secondary';

  @ApiProperty({ description: 'Début de la plage horaire (ISO 8601)' })
  @IsDateString()
  startDatetime!: string;

  @ApiProperty({ description: 'Fin de la plage horaire (ISO 8601)' })
  @IsDateString()
  endDatetime!: string;

  @ApiPropertyOptional({ maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Les notes ne peuvent pas dépasser 500 caractères.' })
  notes?: string;
}

export class AssignBookingGuidesDto {
  @ApiProperty({ type: [AssignBookingGuideItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'Au moins un créneau guide doit être fourni.' })
  @ValidateNested({ each: true })
  @Type(() => AssignBookingGuideItemDto)
  guides!: AssignBookingGuideItemDto[];
}

export class UpdateBookingGuideAssignmentDto {
  @ApiPropertyOptional({ enum: ['primary', 'secondary'] })
  @IsOptional()
  @IsEnum(['primary', 'secondary'], {
    message: 'Le rôle doit être primary ou secondary.',
  })
  role?: 'primary' | 'secondary';

  @ApiPropertyOptional({ description: 'Début de la plage horaire (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDatetime?: string;

  @ApiPropertyOptional({ description: 'Fin de la plage horaire (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDatetime?: string;

  @ApiPropertyOptional({ maxLength: 500, nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'Les notes ne peuvent pas dépasser 500 caractères.' })
  notes?: string | null;
}

export class RemoveBookingGuideDto {
  @ApiPropertyOptional({
    description: 'Message transmis au guide lors du retrait de la mission',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Le commentaire ne peut pas dépasser 2000 caractères.' })
  comment?: string;
}

export class BookingGuideAssignmentDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

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

  @ApiProperty()
  assignedAt!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  assignedByUserId!: string | null;
}

function formatTimestamp(value: string | Date | null | undefined): string {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function toBookingGuideAssignmentDto(
  row: BookingGuideAssignments,
): BookingGuideAssignmentDto {
  return {
    id: row.id,
    bookingId: row.bookingId,
    guideId: row.guideId,
    role: row.role,
    startDatetime: formatTimestamp(row.startDatetime),
    endDatetime: formatTimestamp(row.endDatetime),
    notes: row.notes ?? null,
    assignedAt: formatTimestamp(row.assignedAt),
    assignedByUserId: row.assignedByUserId ?? null,
  };
}

export function assignmentHistorySnapshot(row: BookingGuideAssignments): Record<string, unknown> {
  return {
    bookingId: row.bookingId,
    guideId: row.guideId,
    role: row.role,
    startDatetime: formatTimestamp(row.startDatetime),
    endDatetime: formatTimestamp(row.endDatetime),
    notes: row.notes ?? null,
  };
}
