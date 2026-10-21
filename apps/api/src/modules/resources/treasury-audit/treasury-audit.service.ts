import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import {
  TreasuryAuditAction,
  TreasuryAuditActorType,
  TreasuryAuditEntityType,
  TreasuryAuditLogs,
} from '../../../entities/treasury-audit-log.entity';
import {
  TreasuryAuditLogDto,
  toTreasuryAuditLogDto,
} from './dto/treasury-audit-log.dto';
import { TreasuryAuditLogsListQueryDto } from './dto/treasury-audit-logs-list-query.dto';

export type TreasuryAuditWriteParams = {
  organizationId: string;
  entityType: TreasuryAuditEntityType;
  entityId: string;
  action: TreasuryAuditAction;
  actorType?: TreasuryAuditActorType;
  actorId?: string | null;
  oldJson?: Record<string, unknown> | null;
  newJson?: Record<string, unknown> | null;
  correlationId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

/**
 * Journal append-only trésorerie — écriture depuis services métier + lecture filtrée.
 */
@Injectable()
export class TreasuryAuditService {
  constructor(
    @InjectRepository(TreasuryAuditLogs)
    private readonly auditRepo: Repository<TreasuryAuditLogs>,
  ) {}

  async log(params: TreasuryAuditWriteParams): Promise<TreasuryAuditLogs> {
    const row = this.auditRepo.create({
      id: newId(),
      organizationId: params.organizationId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      actorType: params.actorType ?? 'user',
      actorId: params.actorId ?? null,
      oldJson: params.oldJson ?? null,
      newJson: params.newJson ?? null,
      correlationId: params.correlationId ?? null,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent?.slice(0, 512) ?? null,
    });
    return this.auditRepo.save(row);
  }

  async findAll(
    query: TreasuryAuditLogsListQueryDto,
  ): Promise<PaginatedResult<TreasuryAuditLogDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.auditRepo.createQueryBuilder('log');

    if (query.organizationId) {
      qb.andWhere('log.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }
    if (query.entityType) {
      qb.andWhere('log.entityType = :entityType', {
        entityType: query.entityType,
      });
    }
    if (query.entityId) {
      qb.andWhere('log.entityId = :entityId', { entityId: query.entityId });
    }
    if (query.action) {
      qb.andWhere('log.action = :action', { action: query.action });
    }
    if (query.actorId) {
      qb.andWhere('log.actorId = :actorId', { actorId: query.actorId });
    }
    if (query.dateFrom) {
      qb.andWhere('DATE(log.createdAt) >= :dateFrom', {
        dateFrom: query.dateFrom.slice(0, 10),
      });
    }
    if (query.dateTo) {
      qb.andWhere('DATE(log.createdAt) <= :dateTo', {
        dateTo: query.dateTo.slice(0, 10),
      });
    }

    const [logs, total] = await qb
      .orderBy('log.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: logs.map(toTreasuryAuditLogDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<TreasuryAuditLogDto> {
    const log = await this.auditRepo.findOne({ where: { id } });
    if (!log) {
      throw new NotFoundException(`Treasury audit log ${id} not found`);
    }
    return toTreasuryAuditLogDto(log);
  }
}
