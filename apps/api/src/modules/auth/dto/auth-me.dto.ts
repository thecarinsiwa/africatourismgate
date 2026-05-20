import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from './auth-user.dto';

export class AuthMeDto {
  @ApiProperty({ type: UserDto })
  user!: UserDto;

  @ApiProperty({ type: [String], example: ['users.read', 'roles.read'] })
  permissions!: string[];

  @ApiProperty({ example: false })
  isSuperAdmin!: boolean;
}
