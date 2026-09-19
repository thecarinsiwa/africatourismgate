import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class MobileMoneyCountriesListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: 'organizationId doit être un UUID valide.' })
  organizationId?: string;
}

export class MobileMoneyOperatorsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: 'organizationId doit être un UUID valide.' })
  organizationId?: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'countryId doit être un UUID valide.' })
  countryId!: string;
}

export class MobileMoneyPaymentNumbersListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: 'organizationId doit être un UUID valide.' })
  organizationId?: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID('4', { message: 'operatorId doit être un UUID valide.' })
  operatorId!: string;
}

export class MobileMoneyScopedQueryDto {
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4', { message: 'organizationId doit être un UUID valide.' })
  organizationId?: string;
}
