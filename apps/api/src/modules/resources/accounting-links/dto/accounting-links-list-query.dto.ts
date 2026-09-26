import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

const FUND_OP_TYPES = ['fund_entry', 'fund_exit'] as const;
const STATUSES = ['pending', 'linked', 'skipped'] as const;

export class AccountingLinksListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  organizationId?: string;

  @ApiPropertyOptional({ enum: FUND_OP_TYPES })
  @IsOptional()
  @IsIn(FUND_OP_TYPES)
  fundOpType?: (typeof FUND_OP_TYPES)[number];

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  fundOpId?: string;

  @ApiPropertyOptional({ enum: STATUSES })
  @IsOptional()
  @IsIn(STATUSES)
  status?: (typeof STATUSES)[number];
}
