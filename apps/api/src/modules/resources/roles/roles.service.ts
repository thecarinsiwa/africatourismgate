import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Permissions, RolePermissions, Roles } from '../../../entities/generated';
import { CreateRoleDto } from './dto/create-role.dto';
import { ReplaceRolePermissionsDto, RolePermissionsPayloadDto } from './dto/replace-role-permissions.dto';
import { RoleDto, toRoleDto } from './dto/role.dto';
import { RolesListQueryDto } from './dto/roles-list-query.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

const SYSTEM_ROLE_MESSAGE = 'Les rôles système ne peuvent pas être modifiés.';

@Injectable()
export class RolesService {
  private readonly crud: CrudService<Roles>;

  constructor(
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
    @InjectRepository(Permissions)
    private readonly permissionsRepository: Repository<Permissions>,
    @InjectRepository(RolePermissions)
    private readonly rolePermissionsRepository: Repository<RolePermissions>,
  ) {
    this.crud = new CrudService(rolesRepository);
  }

  async findAll(query: RolesListQueryDto): Promise<PaginatedResult<RoleDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.rolesRepository
      .createQueryBuilder('role')
      .where('role.deletedAt IS NULL');

    if (query.includeSystem === false) {
      qb.andWhere('role.isSystem = 0');
    }

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(role.code) LIKE :pattern', { pattern })
            .orWhere('LOWER(role.name) LIKE :pattern', { pattern });
        }),
      );
    }

    qb.orderBy('role.isSystem', 'DESC')
      .addOrderBy('role.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();

    return {
      data: rows.map(toRoleDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<RoleDto> {
    const role = await this.getActiveRole(id);
    return toRoleDto(role);
  }

  async create(dto: CreateRoleDto, actorUserId?: string): Promise<RoleDto> {
    const code = dto.code.trim().toLowerCase();
    await this.assertCodeAvailable(code);

    const role = await this.crud.create(
      {
        code,
        name: dto.name.trim(),
        description: dto.description?.trim() ?? null,
        isSystem: 0,
      } as DeepPartial<Roles>,
      actorUserId,
    );
    return toRoleDto(role);
  }

  async update(
    id: string,
    dto: UpdateRoleDto,
    actorUserId?: string,
  ): Promise<RoleDto> {
    const existing = await this.getActiveRole(id);
    this.assertNotSystemRole(existing);

    const payload: DeepPartial<Roles> = {};
    if (dto.name !== undefined) payload.name = dto.name.trim();
    if (dto.description !== undefined) {
      payload.description = (dto.description?.trim() ?? null) as DeepPartial<Roles>['description'];
    }

    const role = await this.crud.update(id, payload, actorUserId);
    return toRoleDto(role);
  }

  async remove(id: string, actorUserId?: string): Promise<void> {
    const existing = await this.getActiveRole(id);
    this.assertNotSystemRole(existing);
    await this.crud.remove(id, actorUserId);
  }

  async getRolePermissions(roleId: string): Promise<RolePermissionsPayloadDto> {
    await this.getActiveRole(roleId);

    const rows = await this.rolePermissionsRepository
      .createQueryBuilder('rp')
      .where('rp.roleId = :roleId', { roleId })
      .andWhere('rp.deletedAt IS NULL')
      .getMany();

    return {
      roleId,
      permissionIds: rows.map((r) => r.permissionId),
    };
  }

  async replaceRolePermissions(
    roleId: string,
    dto: ReplaceRolePermissionsDto,
    actorUserId?: string,
  ): Promise<RolePermissionsPayloadDto> {
    const role = await this.getActiveRole(roleId);
    this.assertNotSystemRole(role);

    const uniqueIds = [...new Set(dto.permissionIds)];
    if (uniqueIds.length > 0) {
      const count = await this.permissionsRepository
        .createQueryBuilder('perm')
        .where('perm.id IN (:...ids)', { ids: uniqueIds })
        .andWhere('perm.deletedAt IS NULL')
        .getCount();
      if (count !== uniqueIds.length) {
        throw new NotFoundException('Une ou plusieurs permissions sont introuvables.');
      }
    }

    const existing = await this.rolePermissionsRepository.find({
      where: { roleId },
    });

    const targetSet = new Set(uniqueIds);
    const now = new Date();

    for (const row of existing) {
      const shouldHave = targetSet.has(row.permissionId);
      if (shouldHave && row.deletedAt) {
        await this.rolePermissionsRepository.recover(row);
        if (actorUserId) {
          await this.rolePermissionsRepository.update(
            { roleId, permissionId: row.permissionId } as never,
            {
              grantedByUserId: actorUserId,
              grantedAt: now,
              updatedByUserId: actorUserId,
            } as never,
          );
        }
      } else if (!shouldHave && !row.deletedAt) {
        await this.rolePermissionsRepository.softRemove(row);
        if (actorUserId) {
          await this.rolePermissionsRepository.update(
            { roleId, permissionId: row.permissionId } as never,
            { deletedByUserId: actorUserId } as never,
          );
        }
      }
    }

    for (const permissionId of uniqueIds) {
      const row = existing.find((r) => r.permissionId === permissionId);
      if (!row) {
        const created = this.rolePermissionsRepository.create({
          roleId,
          permissionId,
          grantedAt: now,
          grantedByUserId: actorUserId ?? null,
          createdByUserId: actorUserId ?? null,
        } as DeepPartial<RolePermissions>);
        await this.rolePermissionsRepository.save(created);
      }
    }

    return this.getRolePermissions(roleId);
  }

  private async getActiveRole(id: string): Promise<Roles> {
    const role = await this.rolesRepository.findOne({ where: { id } });
    if (!role || role.deletedAt) {
      throw new NotFoundException(`Resource ${id} not found`);
    }
    return role;
  }

  private assertNotSystemRole(role: Roles): void {
    if (role.isSystem) {
      throw new ForbiddenException(SYSTEM_ROLE_MESSAGE);
    }
  }

  private async assertCodeAvailable(code: string, excludeId?: string): Promise<void> {
    const existing = await this.rolesRepository
      .createQueryBuilder('role')
      .where('LOWER(role.code) = :code', { code: code.toLowerCase() })
      .andWhere('role.deletedAt IS NULL')
      .getOne();

    if (existing && existing.id !== excludeId) {
      throw new ConflictException('Ce code de rôle est déjà utilisé.');
    }
  }
}
