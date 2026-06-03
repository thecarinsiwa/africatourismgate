import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class PromotionsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Partial match on name or description' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  search?: string;
}
