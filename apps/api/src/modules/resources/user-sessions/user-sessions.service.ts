import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { UserSessions } from '../../../entities/generated';
import { PermissionsService } from '../../rbac/permissions.service';
import { toUserSessionDto, UserSessionDto } from './dto/user-session.dto';
import { UserSessionsListQueryDto } from './dto/user-sessions-list-query.dto';

@Injectable()
export class UserSessionsService {
  constructor(
    @InjectRepository(UserSessions)
    private readonly repository: Repository<UserSessions>,
    private readonly permissionsService: PermissionsService,
  ) {}

  private async isStaffUser(userId: string): Promise<boolean> {
    if (await this.permissionsService.hasSuperAdminRole(userId)) {
      return true;
    }
    return this.permissionsService.hasAnyPermission(userId, ['users.read']);
  }

  private assertOwnership(row: UserSessions, userId: string): void {
    if (row.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }
  }

  async findAll(
    query: UserSessionsListQueryDto,
    currentUserId: string,
  ): Promise<PaginatedResult<UserSessionDto>> {
    const staff = await this.isStaffUser(currentUserId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: FindOptionsWhere<UserSessions> = { deletedAt: IsNull() };
    if (staff) {
      if (query.userId) {
        where.userId = query.userId;
      }
    } else {
      where.userId = currentUserId;
    }

    const [rows, total] = await this.repository.findAndCount({
      where,
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data: rows.map(toUserSessionDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string, currentUserId: string): Promise<UserSessionDto> {
    const row = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!row) {
      throw new NotFoundException(`Resource ${id} not found`);
    }
    const staff = await this.isStaffUser(currentUserId);
    if (!staff) {
      this.assertOwnership(row, currentUserId);
    }
    return toUserSessionDto(row);
  }

  /** Revoke session (soft-delete). */
  async revoke(id: string, currentUserId: string): Promise<void> {
    const existing = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!existing) {
      throw new NotFoundException(`Resource ${id} not found`);
    }

    const staff = await this.isStaffUser(currentUserId);
    if (!staff) {
      this.assertOwnership(existing, currentUserId);
    }

    await this.repository.softDelete(id);
    await this.repository.update(id, { deletedByUserId: currentUserId });
  }
}
