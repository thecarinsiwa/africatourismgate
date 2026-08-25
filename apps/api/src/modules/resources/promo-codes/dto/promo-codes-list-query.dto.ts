import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class PromoCodesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Partial match on promo code' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
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
}
