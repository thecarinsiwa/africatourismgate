import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class ExchangeRatesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  organizationId?: string;

  @ApiPropertyOptional({ example: 'EUR' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  fromCurrency?: string;

  @ApiPropertyOptional({ example: 'XOF' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Za-z]{3}$/)
  toCurrency?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Inclusive lower bound on effectiveOn',
  })
  @IsOptional()
  @IsDateString()
  effectiveOnFrom?: string;

  @ApiPropertyOptional({
    example: '2026-12-31',
    description: 'Inclusive upper bound on effectiveOn',
  })
  @IsOptional()
  @IsDateString()
  effectiveOnTo?: string;
}
