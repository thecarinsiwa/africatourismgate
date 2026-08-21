import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

function parseBooleanQuery(value: unknown): boolean | undefined {
  if (value === true || value === 'true' || value === '1' || value === 1) {
    return true;
  }
  if (value === false || value === 'false' || value === '0' || value === 0) {
    return false;
  }
  return undefined;
}

export class AirportsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by IATA code, name or city' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;

  @ApiPropertyOptional({
    description:
      'Filter airports that have (true) or lack (false) latitude and longitude',
  })
  @IsOptional()
  @Transform(({ value }) => parseBooleanQuery(value))
  @IsBoolean()
  hasCoordinates?: boolean;
}
