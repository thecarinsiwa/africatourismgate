import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { Roles, Users, UserRoleAssignments } from '../../../entities/generated';
import { CreateUserRoleAssignmentDto } from './dto/create-user-role-assignment.dto';
import {
  toUserRoleAssignmentDto,
  UserRoleAssignmentDto,
} from './dto/user-role-assignment.dto';
import { UserRoleAssignmentsListQueryDto } from './dto/user-role-assignments-list-query.dto';

@Injectable()
export class UserRoleAssignmentsService {
  private readonly crud: CrudService<UserRoleAssignments>;

  constructor(
    @InjectRepository(UserRoleAssignments)
    private readonly assignmentsRepository: Repository<UserRoleAssignments>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
  ) {
    this.crud = new CrudService(assignmentsRepository);
  }

  async findAll(
    query: UserRoleAssignmentsListQueryDto,
  ): Promise<PaginatedResult<UserRoleAssignmentDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.assignmentsRepository
      .createQueryBuilder('a')
      .where('a.deletedAt IS NULL');

    if (!query.includeRevoked) {
      qb.andWhere('a.revokedAt IS NULL');
    }

    if (query.userId) {
      qb.andWhere('a.userId = :userId', { userId: query.userId });
    }

    if (query.roleId) {
      qb.andWhere('a.roleId = :roleId', { roleId: query.roleId });
    }

    qb.orderBy('a.assignedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();
    const userIds = [...new Set(rows.map((r) => r.userId))];
    const roleIds = [...new Set(rows.map((r) => r.roleId))];

    const usersById = await this.loadUsersByIds(userIds);
    const rolesById = await this.loadRolesByIds(roleIds);

    return {
      data: rows.map((row) =>
        toUserRoleAssignmentDto(
          row,
          usersById.get(row.userId) ?? null,
          rolesById.get(row.roleId) ?? null,
        ),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<UserRoleAssignmentDto> {
    const row = await this.getActiveAssignment(id);
    const user = await this.usersRepository.findOne({ where: { id: row.userId } });
    const role = await this.rolesRepository.findOne({ where: { id: row.roleId } });
    return toUserRoleAssignmentDto(row, user, role);
  }

  async create(
    dto: CreateUserRoleAssignmentDto,
    actorUserId?: string,
  ): Promise<UserRoleAssignmentDto> {
    await this.assertUserExists(dto.userId);
    await this.assertRoleExists(dto.roleId);

    const scopeId = this.normalizeScope(dto.scopeType, dto.scopeId);
    await this.assertNoDuplicateActive(dto.userId, dto.roleId, dto.scopeType, scopeId);

    const now = new Date();
    const assignment = await this.crud.create(
      {
        userId: dto.userId,
        roleId: dto.roleId,
        scopeType: dto.scopeType,
        scopeId,
        assignedByUserId: actorUserId ?? null,
        assignedAt: now,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      } as DeepPartial<UserRoleAssignments>,
      actorUserId,
    );

    const user = await this.usersRepository.findOne({ where: { id: dto.userId } });
    const role = await this.rolesRepository.findOne({ where: { id: dto.roleId } });
    return toUserRoleAssignmentDto(assignment, user, role);
  }

  async revoke(id: string, actorUserId?: string): Promise<UserRoleAssignmentDto> {
    const row = await this.getActiveAssignment(id);
    if (row.revokedAt) {
      throw new BadRequestException('Cette assignation est déjà révoquée.');
    }

    const now = new Date();
    const updated = await this.crud.update(
      id,
      {
        revokedAt: now,
        revokedByUserId: actorUserId ?? null,
      } as DeepPartial<UserRoleAssignments>,
      actorUserId,
    );

    const user = await this.usersRepository.findOne({ where: { id: row.userId } });
    const role = await this.rolesRepository.findOne({ where: { id: row.roleId } });
    return toUserRoleAssignmentDto(updated, user, role);
  }

  private normalizeScope(
    scopeType: CreateUserRoleAssignmentDto['scopeType'],
    scopeId?: string,
  ): string | null {
    if (scopeType === 'global') {
      if (scopeId?.trim()) {
        throw new BadRequestException(
          'Un scope global ne doit pas avoir d’identifiant de scope.',
        );
      }
      return null;
    }
    if (!scopeId?.trim()) {
      throw new BadRequestException(
        "L'identifiant de scope est obligatoire pour ce type de périmètre.",
      );
    }
    return scopeId.trim();
  }

  private async assertUserExists(userId: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user || user.deletedAt) {
      throw new NotFoundException('Utilisateur introuvable.');
    }
  }

  private async assertRoleExists(roleId: string): Promise<void> {
    const role = await this.rolesRepository.findOne({ where: { id: roleId } });
    if (!role || role.deletedAt) {
      throw new NotFoundException('Rôle introuvable.');
    }
  }

  private async assertNoDuplicateActive(
    userId: string,
    roleId: string,
    scopeType: string,
    scopeId: string | null,
  ): Promise<void> {
    const qb = this.assignmentsRepository
      .createQueryBuilder('a')
      .where('a.userId = :userId', { userId })
      .andWhere('a.roleId = :roleId', { roleId })
      .andWhere('a.scopeType = :scopeType', { scopeType })
      .andWhere('a.deletedAt IS NULL')
      .andWhere('a.revokedAt IS NULL');

    if (scopeId === null) {
      qb.andWhere('a.scopeId IS NULL');
    } else {
      qb.andWhere('a.scopeId = :scopeId', { scopeId });
    }

    const existing = await qb.getOne();
    if (existing) {
      throw new ConflictException(
        'Cet utilisateur possède déjà ce rôle sur ce périmètre.',
      );
    }
  }

  private async getActiveAssignment(id: string): Promise<UserRoleAssignments> {
    const row = await this.assignmentsRepository.findOne({ where: { id } });
    if (!row || row.deletedAt) {
      throw new NotFoundException(`Resource ${id} not found`);
    }
    return row;
  }

  private async loadUsersByIds(ids: string[]): Promise<Map<string, Users>> {
    const map = new Map<string, Users>();
    if (ids.length === 0) return map;
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...ids)', { ids })
      .getMany();
    for (const u of users) map.set(u.id, u);
    return map;
  }

  private async loadRolesByIds(ids: string[]): Promise<Map<string, Roles>> {
    const map = new Map<string, Roles>();
    if (ids.length === 0) return map;
    const roles = await this.rolesRepository
      .createQueryBuilder('role')
      .where('role.id IN (:...ids)', { ids })
      .getMany();
    for (const r of roles) map.set(r.id, r);
    return map;
  }
}
