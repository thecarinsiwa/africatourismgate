import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class PromoCodesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Partial match on promo code' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  search?: string;
}
