import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  AccountingExercises,
  AccountingPeriods,
} from '../../../../entities/accounting-exercise.entity';

export class AccountingPeriodDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  exerciseId!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty({ example: '2026-01' })
  code!: string;

  @ApiProperty({ example: '2026-01-01' })
  startsOn!: string;

  @ApiProperty({ example: '2026-01-31' })
  endsOn!: string;

  @ApiProperty({ enum: ['open', 'locked', 'closed'] })
  status!: 'open' | 'locked' | 'closed';

  @ApiProperty({ example: 1 })
  sequenceNo!: number;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}

export class AccountingExerciseDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty({ example: '2026' })
  code!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty({ example: '2026-01-01' })
  startsOn!: string;

  @ApiProperty({ example: '2026-12-31' })
  endsOn!: string;

  @ApiProperty({ example: 'XOF' })
  currency!: string;

  @ApiProperty({ enum: ['open', 'closing', 'closed'] })
  status!: 'open' | 'closing' | 'closed';

  @ApiPropertyOptional({ nullable: true })
  closedAt!: string | null;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  closedByUserId!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;

  @ApiPropertyOptional({ type: [AccountingPeriodDto] })
  periods?: AccountingPeriodDto[];
}

function dateOnly(value: string | Date): string {
  if (typeof value === 'string') {
    return value.slice(0, 10);
  }
  return value.toISOString().slice(0, 10);
}

export function toAccountingPeriodDto(
  row: AccountingPeriods,
): AccountingPeriodDto {
  return {
    id: row.id,
    exerciseId: row.exerciseId,
    organizationId: row.organizationId,
    code: row.code,
    startsOn: dateOnly(row.startsOn),
    endsOn: dateOnly(row.endsOn),
    status: row.status,
    sequenceNo: row.sequenceNo,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
}

export function toAccountingExerciseDto(
  row: AccountingExercises,
  periods?: AccountingPeriodDto[],
): AccountingExerciseDto {
  return {
    id: row.id,
    organizationId: row.organizationId,
    code: row.code,
    label: row.label,
    startsOn: dateOnly(row.startsOn),
    endsOn: dateOnly(row.endsOn),
    currency: row.currency,
    status: row.status,
    closedAt: row.closedAt ? row.closedAt.toISOString() : null,
    closedByUserId: row.closedByUserId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
    ...(periods ? { periods } : {}),
  };
}
