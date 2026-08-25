import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

const SCOPE_TYPES = ['global', 'property', 'agency', 'support_queue'] as const;
export type UserRoleAssignmentScopeType = (typeof SCOPE_TYPES)[number];

export class CreateUserRoleAssignmentDto {
  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty({ message: "L'identifiant utilisateur est obligatoire." })
  @IsUUID('4', { message: "L'identifiant utilisateur doit être un UUID valide." })
  userId!: string;

  @ApiProperty({ format: 'uuid' })
  @IsNotEmpty({ message: "L'identifiant du rôle est obligatoire." })
  @IsUUID('4', { message: "L'identifiant du rôle doit être un UUID valide." })
  roleId!: string;

  @ApiProperty({ enum: SCOPE_TYPES })
  @IsEnum(SCOPE_TYPES, {
    message: 'Le type de périmètre doit être global, property, agency ou support_queue.',
  })
  scopeType!: UserRoleAssignmentScopeType;

  @ApiPropertyOptional({ format: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID('4', {
    message: "L'identifiant de périmètre doit être un UUID valide.",
  })
  scopeId?: string | null;

  @ApiPropertyOptional({ format: 'date-time', nullable: true })
  @IsOptional()
  @IsDateString({}, { message: "La date d'expiration doit être une date ISO valide." })
  expiresAt?: string | null;
}
