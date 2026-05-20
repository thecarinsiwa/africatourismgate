import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class PointsOfInterestListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by destination id' })
  @IsOptional()
  @IsUUID('4', { message: 'destinationId doit être un UUID valide.' })
  destinationId?: string;
}
