import { Global, Module } from '@nestjs/common';
import {
  Permissions,
  RbacAuditLogs,
  RolePermissions,
  Roles,
  UserRoleAssignments,
} from '../../entities/generated/rbac.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsGuard } from './guards/permissions.guard';
import { SuperAdminGuard } from './guards/super-admin.guard';
import { PermissionsService } from './permissions.service';
import { RbacAuditService } from './rbac-audit.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Permissions,
      Roles,
      RolePermissions,
      UserRoleAssignments,
      RbacAuditLogs,
    ]),
  ],
  providers: [PermissionsService, RbacAuditService, PermissionsGuard, SuperAdminGuard],
  exports: [PermissionsService, RbacAuditService, PermissionsGuard, SuperAdminGuard],
})
export class RbacModule {}
