import { ApiProperty } from '@nestjs/swagger';
import { AuthUserDto } from './auth-user.dto';

export class AuthMeDto {
  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;

  @ApiProperty({ type: [String], example: ['users.read', 'roles.read'] })
  permissions!: string[];

  @ApiProperty({ example: false })
  isSuperAdmin!: boolean;
}
