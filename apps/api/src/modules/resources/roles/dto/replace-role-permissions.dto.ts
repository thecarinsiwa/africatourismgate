import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsUUID } from 'class-validator';

export class ReplaceRolePermissionsDto {
  @ApiProperty({ type: [String], format: 'uuid' })
  @IsArray()
  @IsUUID('4', { each: true })
  permissionIds!: string[];
}

export class RolePermissionsPayloadDto {
  @ApiProperty({ format: 'uuid' })
  roleId!: string;

  @ApiProperty({ type: [String], format: 'uuid' })
  permissionIds!: string[];
}
