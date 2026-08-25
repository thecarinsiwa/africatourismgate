import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';

export class UserRoleAssignmentsListQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Search by user name/email or role code/name' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  search?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  userId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID('4')
  roleId?: string;

  @ApiPropertyOptional({ enum: ['global', 'property', 'agency', 'support_queue'] })
  @IsOptional()
  @IsEnum(['global', 'property', 'agency', 'support_queue'])
  scopeType?: 'global' | 'property' | 'agency' | 'support_queue';

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  includeRevoked?: boolean = false;
}
