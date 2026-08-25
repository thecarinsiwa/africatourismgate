import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import {
  Permissions,
  RolePermissions,
  Roles,
} from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import type { RolePermissionsPayloadDto } from './dto/replace-role-permissions.dto';

@Injectable()
export class RolesService extends CrudService<Roles> {
  constructor(
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
    @InjectRepository(RolePermissions)
    private readonly rolePermissionsRepository: Repository<RolePermissions>,
    @InjectRepository(Permissions)
    private readonly permissionsRepository: Repository<Permissions>,
  ) {
    super(rolesRepository);
  }

  async getPermissions(roleId: string): Promise<RolePermissionsPayloadDto> {
    await this.findOne(roleId);

    const rows = await this.rolePermissionsRepository.find({
      where: { roleId, deletedAt: IsNull() },
      select: ['permissionId'],
    });

    return {
      roleId,
      permissionIds: rows.map((row) => row.permissionId),
    };
  }

  async replacePermissions(
    roleId: string,
    permissionIds: string[],
    actorUserId?: string,
  ): Promise<RolePermissionsPayloadDto> {
    const role = await this.findOne(roleId);
    if (Boolean(role.isSystem)) {
      throw new ForbiddenException('Cannot modify permissions of a system role');
    }

    const uniqueIds = Array.from(new Set(permissionIds));
    if (uniqueIds.length > 0) {
      const found = await this.permissionsRepository.count({
        where: { id: In(uniqueIds), deletedAt: IsNull() },
      });
      if (found !== uniqueIds.length) {
        throw new BadRequestException('One or more permission IDs are invalid');
      }
    }

    const desired = new Set(uniqueIds);
    const existing = await this.rolePermissionsRepository.find({
      where: { roleId },
      withDeleted: true,
    });

    const now = new Date();
    const toSave: RolePermissions[] = [];

    for (const row of existing) {
      const keep = desired.has(row.permissionId);
      if (keep) {
        desired.delete(row.permissionId);
        if (row.deletedAt != null) {
          row.deletedAt = null;
          row.deletedByUserId = null;
          row.grantedAt = now;
          row.grantedByUserId = actorUserId ?? null;
          row.updatedByUserId = actorUserId ?? null;
          toSave.push(row);
        }
      } else if (row.deletedAt == null) {
        row.deletedAt = now;
        row.deletedByUserId = actorUserId ?? null;
        row.updatedByUserId = actorUserId ?? null;
        toSave.push(row);
      }
    }

    for (const permissionId of desired) {
      toSave.push(
        this.rolePermissionsRepository.create({
          roleId,
          permissionId,
          grantedAt: now,
          grantedByUserId: actorUserId ?? null,
          createdByUserId: actorUserId ?? null,
        }),
      );
    }

    if (toSave.length > 0) {
      await this.rolePermissionsRepository.save(toSave);
    }

    return this.getPermissions(roleId);
  }
}
