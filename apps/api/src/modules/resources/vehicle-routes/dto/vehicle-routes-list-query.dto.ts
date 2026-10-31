import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class VehicleRoutesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  vehicleId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  departureDestinationId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  arrivalDestinationId?: string;

  @ApiPropertyOptional({ description: 'Search on destination names (joined later in UI)' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  search?: string;
}
