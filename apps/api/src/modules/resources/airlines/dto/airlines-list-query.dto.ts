import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class AirlinesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by IATA code or name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;
}
