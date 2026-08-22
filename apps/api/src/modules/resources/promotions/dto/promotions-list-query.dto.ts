import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class PromotionsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Partial match on name or description' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ enum: ['ongoing', 'upcoming', 'expired'] })
  @IsOptional()
  @IsEnum(['ongoing', 'upcoming', 'expired'])
  validity?: 'ongoing' | 'upcoming' | 'expired';

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasDiscount?: boolean;
}
