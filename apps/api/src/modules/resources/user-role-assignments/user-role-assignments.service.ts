import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import {
  Roles,
  UserRoleAssignments,
  Users,
} from '../../../entities/generated';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { newId } from '../../../common/utils/uuid';
import {
  toUserRoleAssignmentDto,
  type UserRoleAssignmentDto,
} from './dto/user-role-assignment.dto';
import type { UserRoleAssignmentsListQueryDto } from './dto/user-role-assignments-list-query.dto';

@Injectable()
export class UserRoleAssignmentsService extends CrudService<UserRoleAssignments> {
  constructor(
    @InjectRepository(UserRoleAssignments)
    private readonly assignmentsRepository: Repository<UserRoleAssignments>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Roles)
    private readonly rolesRepository: Repository<Roles>,
  ) {
    super(assignmentsRepository);
  }

  async findAllEnriched(
    query: UserRoleAssignmentsListQueryDto,
  ): Promise<PaginatedResult<UserRoleAssignmentDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const includeRevoked = query.includeRevoked === true;

    const qb = this.assignmentsRepository
      .createQueryBuilder('ura')
      .where('ura.deletedAt IS NULL')
      .orderBy('ura.assignedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.userId) {
      qb.andWhere('ura.userId = :userId', { userId: query.userId });
    }
    if (query.roleId) {
      qb.andWhere('ura.roleId = :roleId', { roleId: query.roleId });
    }
    if (!includeRevoked) {
      qb.andWhere('ura.revokedAt IS NULL');
      qb.andWhere('(ura.expiresAt IS NULL OR ura.expiresAt > :now)', {
        now: new Date(),
      });
    }

    const [rows, total] = await qb.getManyAndCount();
    const data = await this.enrichRows(rows);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOneEnriched(id: string): Promise<UserRoleAssignmentDto> {
    const row = await this.findOne(id);
    const [dto] = await this.enrichRows([row]);
    return dto;
  }

  async createAssignment(
    dto: {
      userId: string;
      roleId: string;
      scopeType: UserRoleAssignments['scopeType'];
      scopeId?: string | null;
      expiresAt?: string | null;
    },
    actorUserId?: string,
  ): Promise<UserRoleAssignmentDto> {
    const user = await this.usersRepository.findOne({
      where: { id: dto.userId, deletedAt: IsNull() },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const role = await this.rolesRepository.findOne({
      where: { id: dto.roleId, deletedAt: IsNull() },
    });
    if (!role) {
      throw new BadRequestException('Role not found');
    }

    const scopeType = role.code === 'super_admin' ? 'global' : dto.scopeType;
    const scopeId =
      scopeType === 'global' ? null : dto.scopeId?.trim() || null;
    if (scopeType !== 'global' && !scopeId) {
      throw new BadRequestException('scopeId is required for this scope');
    }

    const existingQb = this.assignmentsRepository
      .createQueryBuilder('ura')
      .where('ura.userId = :userId', { userId: dto.userId })
      .andWhere('ura.roleId = :roleId', { roleId: dto.roleId })
      .andWhere('ura.scopeType = :scopeType', { scopeType })
      .andWhere('ura.revokedAt IS NULL')
      .andWhere('ura.deletedAt IS NULL');
    if (scopeId) {
      existingQb.andWhere('ura.scopeId = :scopeId', { scopeId });
    } else {
      existingQb.andWhere('ura.scopeId IS NULL');
    }
    const existing = await existingQb.getOne();
    if (existing) {
      throw new BadRequestException('This assignment already exists for this scope');
    }

    const now = new Date();
    const created = await this.assignmentsRepository.save(
      this.assignmentsRepository.create({
        id: newId(),
        userId: dto.userId,
        roleId: dto.roleId,
        scopeType,
        scopeId,
        assignedByUserId: actorUserId ?? null,
        assignedAt: now,
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
        createdByUserId: actorUserId ?? null,
      }),
    );

    return toUserRoleAssignmentDto(created, user, role);
  }

  async revoke(
    id: string,
    actorUserId?: string,
  ): Promise<UserRoleAssignmentDto> {
    const row = await this.findOne(id);
    if (row.revokedAt) {
      throw new BadRequestException('Assignment is already revoked');
    }

    row.revokedAt = new Date();
    row.revokedByUserId = actorUserId ?? null;
    row.updatedByUserId = actorUserId ?? null;
    const saved = await this.assignmentsRepository.save(row);
    const [dto] = await this.enrichRows([saved]);
    return dto;
  }

  private async enrichRows(
    rows: UserRoleAssignments[],
  ): Promise<UserRoleAssignmentDto[]> {
    if (rows.length === 0) return [];

    const userIds = Array.from(new Set(rows.map((row) => row.userId)));
    const roleIds = Array.from(new Set(rows.map((row) => row.roleId)));

    const [users, roles] = await Promise.all([
      this.usersRepository.find({
        where: { id: In(userIds) },
      }),
      this.rolesRepository.find({
        where: { id: In(roleIds) },
      }),
    ]);

    const userById = new Map(users.map((user) => [user.id, user]));
    const roleById = new Map(roles.map((role) => [role.id, role]));

    return rows.map((row) =>
      toUserRoleAssignmentDto(
        row,
        userById.get(row.userId) ?? null,
        roleById.get(row.roleId) ?? null,
      ),
    );
  }
}
