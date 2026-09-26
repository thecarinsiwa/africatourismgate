import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

const EXPENSE_REQUEST_STATUSES = [
  'draft',
  'submitted',
  'validated',
  'authorized',
  'rejected',
  'cancelled',
  'closed',
] as const;

export class ExpenseRequestsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  organizationId?: string;

  @ApiPropertyOptional({ enum: EXPENSE_REQUEST_STATUSES })
  @IsOptional()
  @IsIn(EXPENSE_REQUEST_STATUSES)
  status?: (typeof EXPENSE_REQUEST_STATUSES)[number];

  @ApiPropertyOptional({ description: 'Search by title or description' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
