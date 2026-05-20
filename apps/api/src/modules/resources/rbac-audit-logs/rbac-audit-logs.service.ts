import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { RbacAuditLogs, Users } from '../../../entities/generated';
import { RbacAuditLogDto, toRbacAuditLogDto } from './dto/rbac-audit-log.dto';
import { RbacAuditLogsListQueryDto } from './dto/rbac-audit-logs-list-query.dto';

@Injectable()
export class RbacAuditLogsService {
  constructor(
    @InjectRepository(RbacAuditLogs)
    private readonly auditRepository: Repository<RbacAuditLogs>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async findAll(
    query: RbacAuditLogsListQueryDto,
  ): Promise<PaginatedResult<RbacAuditLogDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.auditRepository
      .createQueryBuilder('log')
      .where('log.deletedAt IS NULL');

    if (query.eventType) {
      qb.andWhere('log.eventType = :eventType', { eventType: query.eventType });
    }

    if (query.actorUserId) {
      qb.andWhere('log.actorUserId = :actorUserId', {
        actorUserId: query.actorUserId,
      });
    }

    if (query.dateFrom) {
      qb.andWhere('log.createdAt >= :dateFrom', {
        dateFrom: `${query.dateFrom}T00:00:00.000Z`,
      });
    }

    if (query.dateTo) {
      qb.andWhere('log.createdAt <= :dateTo', {
        dateTo: `${query.dateTo}T23:59:59.999Z`,
      });
    }

    qb.orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();
    const actorIds = [
      ...new Set(
        rows.map((r) => r.actorUserId).filter((id): id is string => Boolean(id)),
      ),
    ];
    const actorsById = await this.loadUsersByIds(actorIds);

    return {
      data: rows.map((row) =>
        toRbacAuditLogDto(row, actorsById.get(row.actorUserId) ?? null),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<RbacAuditLogDto> {
    const row = await this.auditRepository.findOne({
      where: { id },
    });
    if (!row || row.deletedAt) {
      throw new NotFoundException(`Audit log ${id} not found`);
    }

    let actor: Users | null = null;
    if (row.actorUserId) {
      actor = await this.usersRepository.findOne({
        where: { id: row.actorUserId },
      });
    }

    return toRbacAuditLogDto(row, actor);
  }

  private async loadUsersByIds(ids: string[]): Promise<Map<string, Users>> {
    const map = new Map<string, Users>();
    if (ids.length === 0) return map;

    const users = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.id IN (:...ids)', { ids })
      .andWhere('user.deletedAt IS NULL')
      .getMany();

    for (const user of users) {
      map.set(user.id, user);
    }
    return map;
  }
}
