import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateUserRoleAssignmentDto {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty()
  @IsUUID('4')
  userId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty()
  @IsUUID('4')
  roleId!: string;

  @ApiProperty({ enum: ['global', 'property', 'agency', 'support_queue'] })
  @IsEnum(['global', 'property', 'agency', 'support_queue'])
  scopeType!: 'global' | 'property' | 'agency' | 'support_queue';

  @ApiPropertyOptional({ format: 'uuid' })
  @ValidateIf((o) => o.scopeType !== 'global')
  @IsNotEmpty({ message: "L'identifiant de scope est obligatoire pour ce type." })
  @IsUUID('4')
  scopeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(32)
  expiresAt?: string;
}
