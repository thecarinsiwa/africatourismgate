import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class ActivityItineraryStopsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid', description: 'Filter by activity id' })
  @IsOptional()
  @IsUUID('4', { message: 'activityId doit être un UUID valide.' })
  activityId?: string;
}
