import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { newId } from '../../../common/utils/uuid';
import {
  TreasuryAuditAction,
  TreasuryAuditActorType,
  TreasuryAuditEntityType,
  TreasuryAuditLogs,
} from '../../../entities/treasury-audit-log.entity';

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
 * Écriture append-only du journal trésorerie.
 * Liste filtrée / lecture → TRESO-031.
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
}
