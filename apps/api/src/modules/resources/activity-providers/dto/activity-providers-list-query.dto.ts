import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class ActivityProvidersListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  destinationId?: string;

  @ApiPropertyOptional({ description: 'Search by provider name' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  search?: string;
}
