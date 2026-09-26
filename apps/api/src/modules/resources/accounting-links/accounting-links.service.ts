import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { newId } from '../../../common/utils/uuid';
import { AccountingLinks } from '../../../entities/accounting-link.entity';
import { FundEntries } from '../../../entities/fund-entry.entity';
import { FundExits } from '../../../entities/fund-exit.entity';
import { TreasuryAuditService } from '../treasury-audit/treasury-audit.service';
import { AccountingLinksListQueryDto } from './dto/accounting-links-list-query.dto';
import {
  AccountingLinkDto,
  toAccountingLinkDto,
} from './dto/accounting-link.dto';
import { CreateAccountingLinkDto } from './dto/create-accounting-link.dto';
import { UpdateAccountingLinkDto } from './dto/update-accounting-link.dto';
import {
  findAccountingMappingRule,
  TREASURY_ACCOUNTING_MAPPING_CONFIG,
  type AccountingMappingConfig,
} from './treasury-accounting-mapping.config';

/**
 * Stub pont comptable (TRESO-039) — traçabilité opération ↔ écriture future.
 * Aucune génération d’écritures SYSCOHADA.
 */
@Injectable()
export class AccountingLinksService {
  constructor(
    @InjectRepository(AccountingLinks)
    private readonly linksRepo: Repository<AccountingLinks>,
    @InjectRepository(FundEntries)
    private readonly fundEntriesRepo: Repository<FundEntries>,
    @InjectRepository(FundExits)
    private readonly fundExitsRepo: Repository<FundExits>,
    private readonly treasuryAudit: TreasuryAuditService,
  ) {}

  getMappingConfig(): AccountingMappingConfig {
    return TREASURY_ACCOUNTING_MAPPING_CONFIG;
  }

  async findAll(
    query: AccountingLinksListQueryDto,
  ): Promise<PaginatedResult<AccountingLinkDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.linksRepo
      .createQueryBuilder('link')
      .where('link.deletedAt IS NULL');

    if (query.organizationId) {
      qb.andWhere('link.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }
    if (query.fundOpType) {
      qb.andWhere('link.fundOpType = :fundOpType', {
        fundOpType: query.fundOpType,
      });
    }
    if (query.fundOpId) {
      qb.andWhere('link.fundOpId = :fundOpId', { fundOpId: query.fundOpId });
    }
    if (query.status) {
      qb.andWhere('link.status = :status', { status: query.status });
    }

    qb.orderBy('link.createdAt', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [rows, total] = await qb.getManyAndCount();
    return {
      data: rows.map(toAccountingLinkDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    };
  }

  async findOne(id: string): Promise<AccountingLinkDto> {
    const row = await this.linksRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Accounting link not found');
    }
    return toAccountingLinkDto(row);
  }

  async create(
    dto: CreateAccountingLinkDto,
    actorUserId?: string | null,
  ): Promise<AccountingLinkDto> {
    await this.assertFundOpExists(dto.fundOpType, dto.fundOpId, dto.organizationId);

    if (dto.mappingRuleKey) {
      const rule = findAccountingMappingRule(dto.mappingRuleKey);
      if (!rule) {
        throw new BadRequestException(
          `Unknown mapping rule key: ${dto.mappingRuleKey}`,
        );
      }
      if (rule.fundOpType !== dto.fundOpType) {
        throw new BadRequestException(
          `Mapping rule ${dto.mappingRuleKey} does not apply to ${dto.fundOpType}`,
        );
      }
    }

    const existing = await this.linksRepo.findOne({
      where: {
        fundOpType: dto.fundOpType,
        fundOpId: dto.fundOpId,
        deletedAt: IsNull(),
      },
    });
    if (existing) {
      throw new ConflictException(
        'An accounting link already exists for this fund operation',
      );
    }

    const row = this.linksRepo.create({
      id: newId(),
      organizationId: dto.organizationId,
      fundOpType: dto.fundOpType,
      fundOpId: dto.fundOpId,
      journalEntryId: dto.journalEntryId ?? null,
      mappingRuleKey: dto.mappingRuleKey ?? null,
      status: dto.status ?? 'pending',
      createdByUserId: actorUserId ?? null,
    });

    try {
      await this.linksRepo.save(row);
    } catch (error: unknown) {
      const err = error as { code?: string };
      if (err?.code === 'ER_DUP_ENTRY') {
        throw new ConflictException(
          'An accounting link already exists for this fund operation',
        );
      }
      throw error;
    }

    await this.treasuryAudit.log({
      organizationId: row.organizationId,
      entityType: 'accounting_link',
      entityId: row.id,
      action: 'create',
      actorType: 'user',
      actorId: actorUserId ?? null,
      oldJson: null,
      newJson: this.snapshot(row),
    });

    return toAccountingLinkDto(row);
  }

  async update(
    id: string,
    dto: UpdateAccountingLinkDto,
    actorUserId?: string | null,
  ): Promise<AccountingLinkDto> {
    const row = await this.linksRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Accounting link not found');
    }

    const oldJson = this.snapshot(row);

    if (dto.mappingRuleKey !== undefined) {
      if (dto.mappingRuleKey) {
        const rule = findAccountingMappingRule(dto.mappingRuleKey);
        if (!rule) {
          throw new BadRequestException(
            `Unknown mapping rule key: ${dto.mappingRuleKey}`,
          );
        }
        if (rule.fundOpType !== row.fundOpType) {
          throw new BadRequestException(
            `Mapping rule ${dto.mappingRuleKey} does not apply to ${row.fundOpType}`,
          );
        }
      }
      row.mappingRuleKey = dto.mappingRuleKey;
    }

    if (dto.journalEntryId !== undefined) {
      row.journalEntryId = dto.journalEntryId;
    }
    if (dto.status !== undefined) {
      row.status = dto.status;
    }
    row.updatedByUserId = actorUserId ?? null;

    await this.linksRepo.save(row);

    await this.treasuryAudit.log({
      organizationId: row.organizationId,
      entityType: 'accounting_link',
      entityId: row.id,
      action: 'update',
      actorType: 'user',
      actorId: actorUserId ?? null,
      oldJson,
      newJson: this.snapshot(row),
    });

    return toAccountingLinkDto(row);
  }

  private async assertFundOpExists(
    fundOpType: 'fund_entry' | 'fund_exit',
    fundOpId: string,
    organizationId: string,
  ): Promise<void> {
    if (fundOpType === 'fund_entry') {
      const entry = await this.fundEntriesRepo.findOne({
        where: { id: fundOpId, deletedAt: IsNull() },
      });
      if (!entry) {
        throw new NotFoundException('Fund entry not found');
      }
      if (entry.organizationId !== organizationId) {
        throw new BadRequestException(
          'organizationId does not match the fund entry',
        );
      }
      return;
    }

    const exit = await this.fundExitsRepo.findOne({
      where: { id: fundOpId, deletedAt: IsNull() },
    });
    if (!exit) {
      throw new NotFoundException('Fund exit not found');
    }
    if (exit.organizationId !== organizationId) {
      throw new BadRequestException(
        'organizationId does not match the fund exit',
      );
    }
  }

  private snapshot(row: AccountingLinks): Record<string, unknown> {
    return {
      id: row.id,
      organizationId: row.organizationId,
      fundOpType: row.fundOpType,
      fundOpId: row.fundOpId,
      journalEntryId: row.journalEntryId,
      mappingRuleKey: row.mappingRuleKey,
      status: row.status,
    };
  }
}
