import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class ShipsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  cruiseLineId?: string;

  @ApiPropertyOptional({ description: 'Search by ship name' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;
}
