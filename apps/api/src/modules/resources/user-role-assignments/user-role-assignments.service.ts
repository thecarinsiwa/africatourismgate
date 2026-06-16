import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import { CrudService } from '../../../common/crud/crud.service';
import { Roles, UserRoleAssignments, Users } from '../../../entities/generated';
import { CreateUserRoleAssignmentDto } from './dto/create-user-role-assignment.dto';
import {
  toUserRoleAssignmentDto,
  UserRoleAssignmentDto,
} from './dto/user-role-assignment.dto';
import { UserRoleAssignmentsListQueryDto } from './dto/user-role-assignments-list-query.dto';

const DUPLICATE_ASSIGNMENT_MESSAGE =
  'Cette assignation existe déjà pour ce périmètre.';

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

  async list(
    query: UserRoleAssignmentsListQueryDto,
  ): Promise<PaginatedResult<UserRoleAssignmentDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.assignmentsRepository
      .createQueryBuilder('assignment')
      .where('assignment.deletedAt IS NULL');

    if (!query.includeRevoked) {
      qb.andWhere('assignment.revokedAt IS NULL');
    }

    if (query.userId) {
      qb.andWhere('assignment.userId = :userId', { userId: query.userId });
    }

    if (query.roleId) {
      qb.andWhere('assignment.roleId = :roleId', { roleId: query.roleId });
    }

    qb.orderBy('assignment.assignedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [assignments, total] = await qb.getManyAndCount();

    const userIds = [...new Set(assignments.map((row) => row.userId))];
    const roleIds = [...new Set(assignments.map((row) => row.roleId))];

    const users =
      userIds.length > 0
        ? await this.usersRepository.find({
            where: { id: In(userIds), deletedAt: IsNull() },
          })
        : [];
    const roles =
      roleIds.length > 0
        ? await this.rolesRepository.find({
            where: { id: In(roleIds), deletedAt: IsNull() },
          })
        : [];

    const userById = new Map(users.map((user) => [user.id, user]));
    const roleById = new Map(roles.map((role) => [role.id, role]));

    return {
      data: assignments.map((assignment) =>
        toUserRoleAssignmentDto(
          assignment,
          userById.get(assignment.userId),
          roleById.get(assignment.roleId),
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

  async findOneDto(id: string): Promise<UserRoleAssignmentDto> {
    const assignment = await this.requireAssignment(id);
    const [user, role] = await Promise.all([
      this.usersRepository.findOne({
        where: { id: assignment.userId, deletedAt: IsNull() },
      }),
      this.rolesRepository.findOne({
        where: { id: assignment.roleId, deletedAt: IsNull() },
      }),
    ]);
    return toUserRoleAssignmentDto(assignment, user, role);
  }

  async createFromDto(
    dto: CreateUserRoleAssignmentDto,
    actorUserId?: string,
  ): Promise<UserRoleAssignmentDto> {
    await this.requireUser(dto.userId);
    await this.requireRole(dto.roleId);
    await this.assertNoDuplicateActiveAssignment(dto);

    const scopeId = dto.scopeType === 'global' ? null : dto.scopeId ?? null;
    const assignment = await this.create(
      {
        id: newId(),
        userId: dto.userId,
        roleId: dto.roleId,
        scopeType: dto.scopeType,
        scopeId,
        assignedByUserId: actorUserId ?? null,
        assignedAt: new Date(),
        expiresAt: dto.expiresAt ? new Date(dto.expiresAt) : null,
      },
      actorUserId,
    );

    const [user, role] = await Promise.all([
      this.usersRepository.findOne({ where: { id: dto.userId } }),
      this.rolesRepository.findOne({ where: { id: dto.roleId } }),
    ]);

    return toUserRoleAssignmentDto(assignment, user, role);
  }

  async revoke(id: string, actorUserId?: string): Promise<UserRoleAssignmentDto> {
    const assignment = await this.requireAssignment(id);

    if (!assignment.revokedAt) {
      assignment.revokedAt = new Date();
      assignment.revokedByUserId = actorUserId ?? null;
      assignment.updatedByUserId = actorUserId ?? null;
      await this.assignmentsRepository.save(assignment);
    }

    const [user, role] = await Promise.all([
      this.usersRepository.findOne({
        where: { id: assignment.userId, deletedAt: IsNull() },
      }),
      this.rolesRepository.findOne({
        where: { id: assignment.roleId, deletedAt: IsNull() },
      }),
    ]);

    return toUserRoleAssignmentDto(assignment, user, role);
  }

  private async requireAssignment(id: string): Promise<UserRoleAssignments> {
    const assignment = await this.assignmentsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!assignment) {
      throw new NotFoundException(`Assignation ${id} introuvable.`);
    }
    return assignment;
  }

  private async requireUser(userId: string): Promise<Users> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
    if (!user) {
      throw new NotFoundException(`Utilisateur ${userId} introuvable.`);
    }
    return user;
  }

  private async requireRole(roleId: string): Promise<Roles> {
    const role = await this.rolesRepository.findOne({
      where: { id: roleId, deletedAt: IsNull() },
    });
    if (!role) {
      throw new NotFoundException(`Rôle ${roleId} introuvable.`);
    }
    return role;
  }

  private async assertNoDuplicateActiveAssignment(
    dto: CreateUserRoleAssignmentDto,
  ): Promise<void> {
    const scopeId = dto.scopeType === 'global' ? null : dto.scopeId ?? null;

    const qb = this.assignmentsRepository
      .createQueryBuilder('assignment')
      .where('assignment.deletedAt IS NULL')
      .andWhere('assignment.revokedAt IS NULL')
      .andWhere('assignment.userId = :userId', { userId: dto.userId })
      .andWhere('assignment.roleId = :roleId', { roleId: dto.roleId })
      .andWhere('assignment.scopeType = :scopeType', { scopeType: dto.scopeType });

    if (scopeId === null) {
      qb.andWhere('assignment.scopeId IS NULL');
    } else {
      qb.andWhere('assignment.scopeId = :scopeId', { scopeId });
    }

    const existing = await qb.getOne();
    if (existing) {
      throw new ConflictException(DUPLICATE_ASSIGNMENT_MESSAGE);
    }
  }
}
