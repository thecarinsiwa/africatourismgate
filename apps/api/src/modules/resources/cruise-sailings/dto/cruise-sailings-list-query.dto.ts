import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class CruiseSailingsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  itineraryId?: string;

  @ApiPropertyOptional({
    description:
      'Partial match on sailing id, departure date, itinerary id, or itinerary name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  search?: string;
}
