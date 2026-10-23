import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { ACTIVITY_BOOKING_REQUEST_STATUSES } from '../activities.constants';

export class ActivityBookingRequestsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  activityId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  organizationId?: string;

  @ApiPropertyOptional({ enum: ACTIVITY_BOOKING_REQUEST_STATUSES })
  @IsOptional()
  @IsIn([...ACTIVITY_BOOKING_REQUEST_STATUSES])
  status?: (typeof ACTIVITY_BOOKING_REQUEST_STATUSES)[number];

  @ApiPropertyOptional({ description: 'Search by full name or email' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;
}
