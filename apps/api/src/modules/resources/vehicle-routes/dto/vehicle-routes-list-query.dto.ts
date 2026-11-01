import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class VehicleRoutesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  vehicleId?: string;

  @ApiPropertyOptional({ example: 'Kinshasa' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  departureCity?: string;

  @ApiPropertyOptional({ example: 'Lubumbashi' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  arrivalCity?: string;

  @ApiPropertyOptional({ description: 'Search on departure / arrival city names' })
  @IsOptional()
  @IsString()
  @MaxLength(180)
  search?: string;
}
