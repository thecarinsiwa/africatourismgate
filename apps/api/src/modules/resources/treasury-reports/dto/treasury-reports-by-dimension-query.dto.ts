import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { TreasuryReportsSummaryQueryDto } from './treasury-reports-summary-query.dto';

const GROUP_BY = ['source', 'paymentMethod'] as const;

export class TreasuryReportsByDimensionQueryDto extends TreasuryReportsSummaryQueryDto {
  @ApiProperty({
    enum: GROUP_BY,
    description:
      'source = entrées seulement ; paymentMethod = entrées + sorties',
  })
  @IsIn([...GROUP_BY])
  groupBy!: (typeof GROUP_BY)[number];
}
