import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import {
  Organizations,
  Properties,
  RentalAgencies,
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
    @InjectRepository(Properties)
    private readonly propertiesRepository: Repository<Properties>,
    @InjectRepository(RentalAgencies)
    private readonly agenciesRepository: Repository<RentalAgencies>,
    @InjectRepository(Organizations)
    private readonly organizationsRepository: Repository<Organizations>,
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

    const search = query.search?.trim();
    if (search) {
      qb.leftJoin(Users, 'user', 'user.id = ura.userId')
        .leftJoin(Roles, 'role', 'role.id = ura.roleId')
        .andWhere(
          `(
            user.email LIKE :search
            OR user.firstName LIKE :search
            OR user.lastName LIKE :search
            OR CONCAT(user.firstName, ' ', user.lastName) LIKE :search
            OR role.code LIKE :search
            OR role.name LIKE :search
          )`,
          { search: `%${search}%` },
        );
    }

    if (query.userId) {
      qb.andWhere('ura.userId = :userId', { userId: query.userId });
    }
    if (query.roleId) {
      qb.andWhere('ura.roleId = :roleId', { roleId: query.roleId });
    }
    if (query.scopeType) {
      qb.andWhere('ura.scopeType = :scopeType', { scopeType: query.scopeType });
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

    const [dtoOut] = await this.enrichRows([created]);
    return dtoOut;
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

    const [users, roles, scopeNameById] = await Promise.all([
      this.usersRepository.find({
        where: { id: In(userIds) },
      }),
      this.rolesRepository.find({
        where: { id: In(roleIds) },
      }),
      this.resolveScopeNames(rows),
    ]);

    const userById = new Map(users.map((user) => [user.id, user]));
    const roleById = new Map(roles.map((role) => [role.id, role]));

    return rows.map((row) =>
      toUserRoleAssignmentDto(
        row,
        userById.get(row.userId) ?? null,
        roleById.get(row.roleId) ?? null,
        row.scopeId ? (scopeNameById.get(row.scopeId) ?? null) : null,
      ),
    );
  }

  private async resolveScopeNames(
    rows: UserRoleAssignments[],
  ): Promise<Map<string, string>> {
    const result = new Map<string, string>();
    const propertyIds = new Set<string>();
    const agencyIds = new Set<string>();
    const unresolvedIds = new Set<string>();

    for (const row of rows) {
      if (!row.scopeId) continue;
      if (row.scopeType === 'property') propertyIds.add(row.scopeId);
      else if (row.scopeType === 'agency') agencyIds.add(row.scopeId);
      else unresolvedIds.add(row.scopeId);
    }

    const [properties, agencies] = await Promise.all([
      propertyIds.size > 0
        ? this.propertiesRepository.find({
            where: { id: In([...propertyIds]) },
            select: ['id', 'name'],
          })
        : Promise.resolve([] as Properties[]),
      agencyIds.size > 0
        ? this.agenciesRepository.find({
            where: { id: In([...agencyIds]) },
            select: ['id', 'name'],
          })
        : Promise.resolve([] as RentalAgencies[]),
    ]);

    for (const property of properties) {
      result.set(property.id, property.name);
    }
    for (const agency of agencies) {
      result.set(agency.id, agency.name);
    }

    for (const id of propertyIds) {
      if (!result.has(id)) unresolvedIds.add(id);
    }
    for (const id of agencyIds) {
      if (!result.has(id)) unresolvedIds.add(id);
    }

    if (unresolvedIds.size > 0) {
      const organizations = await this.organizationsRepository.find({
        where: { id: In([...unresolvedIds]) },
        select: ['id', 'name'],
      });
      for (const organization of organizations) {
        result.set(organization.id, organization.name);
      }
    }

    return result;
  }
}
