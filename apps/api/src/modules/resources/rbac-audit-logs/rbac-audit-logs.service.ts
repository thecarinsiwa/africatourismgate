import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { RbacAuditLogs, Users } from '../../../entities/generated';
import {
  RbacAuditLogDto,
  toRbacAuditLogDto,
} from './dto/rbac-audit-log.dto';
import { RbacAuditLogsListQueryDto } from './dto/rbac-audit-logs-list-query.dto';

@Injectable()
export class RbacAuditLogsService {
  constructor(
    @InjectRepository(RbacAuditLogs)
    private readonly repository: Repository<RbacAuditLogs>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  async findAll(
    query: RbacAuditLogsListQueryDto,
  ): Promise<PaginatedResult<RbacAuditLogDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.repository
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
    if (query.userId) {
      qb.andWhere(
        '(log.actorUserId = :userId OR log.targetUserId = :userId)',
        { userId: query.userId },
      );
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

    const [logs, total] = await qb
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    const actorMap = await this.loadActorsById(logs);

    return {
      data: logs.map((log) =>
        toRbacAuditLogDto(
          log,
          log.actorUserId ? actorMap.get(log.actorUserId) ?? null : null,
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

  async findOne(id: string): Promise<RbacAuditLogDto> {
    const log = await this.repository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!log) {
      throw new NotFoundException(`Resource ${id} not found`);
    }

    let actor: Users | null = null;
    if (log.actorUserId) {
      actor = await this.usersRepository.findOne({
        where: { id: log.actorUserId, deletedAt: IsNull() },
      });
    }

    return toRbacAuditLogDto(log, actor);
  }

  private async loadActorsById(logs: RbacAuditLogs[]): Promise<Map<string, Users>> {
    const actorIds = [
      ...new Set(
        logs
          .map((log) => log.actorUserId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    if (actorIds.length === 0) {
      return new Map();
    }

    const actors = await this.usersRepository.find({
      where: { id: In(actorIds), deletedAt: IsNull() },
    });

    return new Map(actors.map((actor) => [actor.id, actor]));
  }
}
