import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

const PERIOD_TYPES = ['monthly', 'annual'] as const;
const SCOPE_TYPES = ['general', 'activity', 'product'] as const;

export class BudgetsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  organizationId?: string;

  @ApiPropertyOptional({ enum: PERIOD_TYPES })
  @IsOptional()
  @IsIn(PERIOD_TYPES)
  periodType?: (typeof PERIOD_TYPES)[number];

  @ApiPropertyOptional({ example: 2026 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  @Max(2100)
  year?: number;

  @ApiPropertyOptional({ example: 3, minimum: 1, maximum: 12 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ApiPropertyOptional({ enum: SCOPE_TYPES })
  @IsOptional()
  @IsIn(SCOPE_TYPES)
  scopeType?: (typeof SCOPE_TYPES)[number];

  @ApiPropertyOptional({ example: 'XOF' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z]{3}$/i)
  currency?: string;

  @ApiPropertyOptional({ description: 'Search by label or notes' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
