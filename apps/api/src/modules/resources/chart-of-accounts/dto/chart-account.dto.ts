import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { ChartOfAccounts } from '../../../../entities/chart-of-account.entity';

export class ChartAccountDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ format: 'uuid' })
  organizationId!: string;

  @ApiProperty({ example: '57' })
  code!: string;

  @ApiProperty()
  label!: string;

  @ApiProperty({ minimum: 1, maximum: 8, example: 5 })
  classNumber!: number;

  @ApiProperty({
    enum: [
      'equity',
      'fixed_asset',
      'inventory',
      'third_party',
      'treasury',
      'expense',
      'revenue',
      'special',
    ],
  })
  accountType!: string;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  parentId!: string | null;

  @ApiProperty()
  isPostable!: boolean;

  @ApiProperty()
  isActive!: boolean;

  @ApiPropertyOptional({ nullable: true })
  syscohadaRef!: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiPropertyOptional({ nullable: true })
  updatedAt!: string | null;
}

export function toChartAccountDto(row: ChartOfAccounts): ChartAccountDto {
  return {
    id: row.id,
    organizationId: row.organizationId,
    code: row.code,
    label: row.label,
    classNumber: row.classNumber,
    accountType: row.accountType,
    parentId: row.parentId,
    isPostable: row.isPostable,
    isActive: row.isActive,
    syscohadaRef: row.syscohadaRef,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
}
