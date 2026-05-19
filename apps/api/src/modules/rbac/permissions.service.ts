import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  Permissions,
  Roles,
  RolePermissions,
  UserRoleAssignments,
} from '../../entities/generated/rbac.entity';
import { SUPER_ADMIN_ROLE_CODE } from './rbac.constants';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(UserRoleAssignments)
    private readonly assignmentsRepo: Repository<UserRoleAssignments>,
    @InjectRepository(Roles)
    private readonly rolesRepo: Repository<Roles>,
    @InjectRepository(RolePermissions)
    private readonly rolePermissionsRepo: Repository<RolePermissions>,
    @InjectRepository(Permissions)
    private readonly permissionsRepo: Repository<Permissions>,
  ) {}

  async hasSuperAdminRole(userId: string): Promise<boolean> {
    const count = await this.assignmentsRepo
      .createQueryBuilder('ura')
      .innerJoin(Roles, 'role', 'role.id = ura.roleId')
      .where('ura.userId = :userId', { userId })
      .andWhere('ura.deletedAt IS NULL')
      .andWhere('ura.revokedAt IS NULL')
      .andWhere('(ura.expiresAt IS NULL OR ura.expiresAt > :now)', {
        now: new Date(),
      })
      .andWhere('role.code = :code', { code: SUPER_ADMIN_ROLE_CODE })
      .andWhere('role.deletedAt IS NULL')
      .getCount();

    return count > 0;
  }

  async getUserPermissionCodes(userId: string): Promise<Set<string>> {
    const rows = await this.assignmentsRepo
      .createQueryBuilder('ura')
      .innerJoin(Roles, 'role', 'role.id = ura.roleId')
      .innerJoin(RolePermissions, 'rp', 'rp.roleId = role.id')
      .innerJoin(Permissions, 'perm', 'perm.id = rp.permissionId')
      .select('perm.code', 'code')
      .where('ura.userId = :userId', { userId })
      .andWhere('ura.deletedAt IS NULL')
      .andWhere('ura.revokedAt IS NULL')
      .andWhere('(ura.expiresAt IS NULL OR ura.expiresAt > :now)', {
        now: new Date(),
      })
      .andWhere('role.deletedAt IS NULL')
      .andWhere('perm.deletedAt IS NULL')
      .getRawMany<{ code: string }>();

    return new Set(rows.map((r) => r.code));
  }

  async hasAnyPermission(userId: string, required: string[]): Promise<boolean> {
    if (required.length === 0) {
      return true;
    }
    const codes = await this.getUserPermissionCodes(userId);
    return required.some((code) => codes.has(code));
  }

  async findPermissionIdByCode(code: string): Promise<string | null> {
    const perm = await this.permissionsRepo.findOne({
      where: { code, deletedAt: IsNull() },
      select: ['id'],
    });
    return perm?.id ?? null;
  }
}
