import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Users } from '../../../entities/generated/users.entity';

export class AuthUserDto {
  @ApiProperty({ format: 'uuid' })
  id!: string;

  @ApiProperty({ example: 'admin@africatourismgate.local' })
  email!: string;

  @ApiProperty({ example: 'Super' })
  firstName!: string;

  @ApiProperty({ example: 'Admin' })
  lastName!: string;

  @ApiPropertyOptional()
  phone?: string | null;

  @ApiPropertyOptional({ example: 'fr' })
  preferredLanguage?: string | null;

  @ApiPropertyOptional({ format: 'uuid' })
  organizationId?: string | null;

  @ApiProperty({ enum: ['active', 'suspended', 'deleted'] })
  status!: 'active' | 'suspended' | 'deleted';
}

export function toAuthUserDto(user: Users): AuthUserDto {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone ?? null,
    preferredLanguage: user.preferredLanguage ?? null,
    organizationId: user.organizationId ?? null,
    status: user.status,
  };
}
