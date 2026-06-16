import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Permissions, RolePermissions, Roles } from '../../../entities/generated';
import { CreateRoleDto } from './dto/create-role.dto';
import {
  ReplaceRolePermissionsDto,
  RolePermissionsPayloadDto,
} from './dto/replace-role-permissions.dto';
import { RoleDto, toRoleDto } from './dto/role.dto';
import { RolesListQueryDto } from './dto/roles-list-query.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

const SYSTEM_ROLE_MESSAGE = 'Les rôles système ne peuvent pas être modifiés.';

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

  async list(query: RolesListQueryDto): Promise<PaginatedResult<RoleDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.rolesRepository
      .createQueryBuilder('role')
      .where('role.deletedAt IS NULL');

    if (query.includeSystem === false) {
      qb.andWhere('role.isSystem = 0');
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('(role.code LIKE :term OR role.name LIKE :term)', {
        term: `%${search}%`,
      });
    }

    qb.orderBy('role.isSystem', 'DESC')
      .addOrderBy('role.name', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [roles, total] = await qb.getManyAndCount();

    return {
      data: roles.map(toRoleDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOneDto(id: string): Promise<RoleDto> {
    return toRoleDto(await this.requireRole(id));
  }

  async createFromDto(dto: CreateRoleDto, actorUserId?: string): Promise<RoleDto> {
    const existing = await this.rolesRepository.findOne({
      where: { code: dto.code, deletedAt: IsNull() },
    });
    if (existing) {
      throw new ConflictException('Un rôle avec ce code existe déjà.');
    }

    const role = await this.create(
      {
        code: dto.code,
        name: dto.name,
        description: dto.description ?? null,
        isSystem: 0,
      },
      actorUserId,
    );

    return toRoleDto(role);
  }

  async updateFromDto(
    id: string,
    dto: UpdateRoleDto,
    actorUserId?: string,
  ): Promise<RoleDto> {
    const role = await this.requireRole(id);
    this.assertNotSystemRole(role);

    const updated = await this.update(
      id,
      {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
      },
      actorUserId,
    );

    return toRoleDto(updated);
  }

  async removeRole(id: string, actorUserId?: string): Promise<void> {
    const role = await this.requireRole(id);
    this.assertNotSystemRole(role);
    await this.remove(id, actorUserId);
  }

  async getPermissions(roleId: string): Promise<RolePermissionsPayloadDto> {
    await this.requireRole(roleId);

    const rows = await this.rolePermissionsRepository.find({
      where: { roleId },
    });

    return {
      roleId,
      permissionIds: rows.map((row) => row.permissionId),
    };
  }

  async replacePermissions(
    roleId: string,
    dto: ReplaceRolePermissionsDto,
    actorUserId?: string,
  ): Promise<RolePermissionsPayloadDto> {
    const role = await this.requireRole(roleId);
    this.assertNotSystemRole(role);

    const permissionIds = [...new Set(dto.permissionIds)];
    if (permissionIds.length > 0) {
      const count = await this.permissionsRepository.count({
        where: { id: In(permissionIds), deletedAt: IsNull() },
      });
      if (count !== permissionIds.length) {
        throw new NotFoundException('Une ou plusieurs permissions sont introuvables.');
      }
    }

    await this.rolePermissionsRepository.delete({ roleId });

    const grantedAt = new Date();
    if (permissionIds.length > 0) {
      await this.rolePermissionsRepository.save(
        permissionIds.map((permissionId) =>
          this.rolePermissionsRepository.create({
            roleId,
            permissionId,
            grantedAt,
            grantedByUserId: actorUserId ?? null,
          }),
        ),
      );
    }

    return { roleId, permissionIds };
  }

  private async requireRole(id: string): Promise<Roles> {
    const role = await this.rolesRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!role) {
      throw new NotFoundException(`Rôle ${id} introuvable.`);
    }
    return role;
  }

  private assertNotSystemRole(role: Roles): void {
    if (role.isSystem) {
      throw new ForbiddenException(SYSTEM_ROLE_MESSAGE);
    }
  }
}
