import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { newId } from '../../../common/utils/uuid';
import {
  AccountingFundOpType,
  AccountingLinks,
} from '../../../entities/accounting-link.entity';
import { FundEntries } from '../../../entities/fund-entry.entity';
import { FundExits } from '../../../entities/fund-exit.entity';
import { TreasuryAuditService } from '../treasury-audit/treasury-audit.service';
import { JournalEntriesService } from '../journal-entries/journal-entries.service';
import {
  AccountingLinkDto,
  toAccountingLinkDto,
} from './dto/accounting-link.dto';
import {
  AccountingMappingEngine,
  type ResolvedMappingRule,
} from './accounting-mapping.engine';

export type PostFundOpResult = {
  link: AccountingLinkDto;
  journalEntryId: string | null;
  noop: boolean;
  mappingRuleKey: string | null;
};

/**
 * Comptabilisation fond → écriture SYSCOHADA (SYSCO-004 + pont SYSCO-005).
 * Déclencheur MVP : action manuelle « Comptabiliser » (éligible si recorded).
 */
@Injectable()
export class AccountingPostingService {
  constructor(
    @InjectRepository(AccountingLinks)
    private readonly linksRepo: Repository<AccountingLinks>,
    @InjectRepository(FundEntries)
    private readonly fundEntriesRepo: Repository<FundEntries>,
    @InjectRepository(FundExits)
    private readonly fundExitsRepo: Repository<FundExits>,
    private readonly mappingEngine: AccountingMappingEngine,
    private readonly journalEntries: JournalEntriesService,
    private readonly treasuryAudit: TreasuryAuditService,
  ) {}

  async postFundOperation(
    fundOpType: AccountingFundOpType,
    fundOpId: string,
    actorUserId?: string | null,
  ): Promise<PostFundOpResult> {
    const op = await this.loadEligibleFundOp(fundOpType, fundOpId);

    let link = await this.linksRepo.findOne({
      where: {
        fundOpType,
        fundOpId,
        deletedAt: IsNull(),
      },
    });

    // Déjà lié avec écriture → no-op idempotent (SYSCO-005)
    if (link?.status === 'linked' && link.journalEntryId) {
      return {
        link: toAccountingLinkDto(link),
        journalEntryId: link.journalEntryId,
        noop: true,
        mappingRuleKey: link.mappingRuleKey,
      };
    }

    // Reprise : pending (ou linked inconsistante) avec journal déjà créé
    if (
      link &&
      link.journalEntryId &&
      (link.status === 'pending' || link.status === 'linked')
    ) {
      const oldJson = this.linkSnapshot(link);
      link.status = 'linked';
      link.updatedByUserId = actorUserId ?? null;
      await this.linksRepo.save(link);
      await this.treasuryAudit.log({
        organizationId: link.organizationId,
        entityType: 'accounting_link',
        entityId: link.id,
        action: 'update',
        actorType: 'user',
        actorId: actorUserId ?? null,
        oldJson,
        newJson: this.linkSnapshot(link),
      });
      return {
        link: toAccountingLinkDto(link),
        journalEntryId: link.journalEntryId,
        noop: false,
        mappingRuleKey: link.mappingRuleKey,
      };
    }

    if (link?.status === 'skipped') {
      throw new ConflictException(
        'Fund operation was skipped for accounting — soft-delete the link (DELETE /accounting-links/:id) then post again',
      );
    }

    const rule = await this.mappingEngine.resolve({
      organizationId: op.organizationId,
      fundOpType,
      source: op.source,
      paymentMethod: op.paymentMethod,
    });

    if (!link) {
      link = this.linksRepo.create({
        id: newId(),
        organizationId: op.organizationId,
        fundOpType,
        fundOpId,
        journalEntryId: null,
        mappingRuleKey: rule.key,
        status: 'pending',
        createdByUserId: actorUserId ?? null,
      });
      await this.linksRepo.save(link);
      await this.treasuryAudit.log({
        organizationId: link.organizationId,
        entityType: 'accounting_link',
        entityId: link.id,
        action: 'create',
        actorType: 'user',
        actorId: actorUserId ?? null,
        oldJson: null,
        newJson: this.linkSnapshot(link),
      });
    } else {
      const oldJson = this.linkSnapshot(link);
      link.mappingRuleKey = rule.key;
      link.status = 'pending';
      link.updatedByUserId = actorUserId ?? null;
      await this.linksRepo.save(link);
      await this.treasuryAudit.log({
        organizationId: link.organizationId,
        entityType: 'accounting_link',
        entityId: link.id,
        action: 'update',
        actorType: 'user',
        actorId: actorUserId ?? null,
        oldJson,
        newJson: this.linkSnapshot(link),
      });
    }

    const journalEntry = await this.createJournalFromFundOp(op, rule, actorUserId);

    const oldJson = this.linkSnapshot(link);
    link.journalEntryId = journalEntry.id;
    link.status = 'linked';
    link.mappingRuleKey = rule.key;
    link.updatedByUserId = actorUserId ?? null;
    await this.linksRepo.save(link);

    await this.treasuryAudit.log({
      organizationId: link.organizationId,
      entityType: 'accounting_link',
      entityId: link.id,
      action: 'update',
      actorType: 'user',
      actorId: actorUserId ?? null,
      oldJson,
      newJson: this.linkSnapshot(link),
    });

    return {
      link: toAccountingLinkDto(link),
      journalEntryId: journalEntry.id,
      noop: false,
      mappingRuleKey: rule.key,
    };
  }

  async skipFundOperation(
    organizationId: string,
    fundOpType: AccountingFundOpType,
    fundOpId: string,
    actorUserId?: string | null,
    reason?: string | null,
  ): Promise<AccountingLinkDto> {
    await this.assertFundOpExists(fundOpType, fundOpId, organizationId);

    let link = await this.linksRepo.findOne({
      where: { fundOpType, fundOpId, deletedAt: IsNull() },
    });

    if (link?.status === 'linked') {
      throw new ConflictException(
        'Cannot skip a fund operation that is already accounting-linked',
      );
    }

    if (!link) {
      link = this.linksRepo.create({
        id: newId(),
        organizationId,
        fundOpType,
        fundOpId,
        journalEntryId: null,
        mappingRuleKey: null,
        status: 'skipped',
        createdByUserId: actorUserId ?? null,
      });
      await this.linksRepo.save(link);
      await this.treasuryAudit.log({
        organizationId,
        entityType: 'accounting_link',
        entityId: link.id,
        action: 'create',
        actorType: 'user',
        actorId: actorUserId ?? null,
        oldJson: null,
        newJson: {
          ...this.linkSnapshot(link),
          skipReason: reason ?? null,
        },
      });
      return toAccountingLinkDto(link);
    }

    const oldJson = this.linkSnapshot(link);
    link.status = 'skipped';
    link.journalEntryId = null;
    link.updatedByUserId = actorUserId ?? null;
    await this.linksRepo.save(link);
    await this.treasuryAudit.log({
      organizationId,
      entityType: 'accounting_link',
      entityId: link.id,
      action: 'update',
      actorType: 'user',
      actorId: actorUserId ?? null,
      oldJson,
      newJson: {
        ...this.linkSnapshot(link),
        skipReason: reason ?? null,
      },
    });
    return toAccountingLinkDto(link);
  }

  private async createJournalFromFundOp(
    op: {
      organizationId: string;
      amountCents: number;
      currency: string;
      operationDate: string;
      reference: string | null;
      fundOpType: AccountingFundOpType;
      fundOpId: string;
    },
    rule: ResolvedMappingRule,
    actorUserId?: string | null,
  ) {
    const entryDate =
      typeof op.operationDate === 'string'
        ? op.operationDate.slice(0, 10)
        : new Date(op.operationDate).toISOString().slice(0, 10);

    const description = `Comptabilisation ${op.fundOpType} ${op.reference ?? op.fundOpId.slice(0, 8)}`;

    return this.journalEntries.create(
      {
        organizationId: op.organizationId,
        journalId: rule.journalId,
        entryDate,
        description,
        status: 'posted',
        source: 'treasury_mapping',
        lines: [
          {
            accountId: rule.debitAccountId,
            label: description,
            debitCents: op.amountCents,
            creditCents: 0,
            originalAmountCents: op.amountCents,
            originalCurrency: op.currency,
          },
          {
            accountId: rule.creditAccountId,
            label: description,
            debitCents: 0,
            creditCents: op.amountCents,
            originalAmountCents: op.amountCents,
            originalCurrency: op.currency,
          },
        ],
      },
      actorUserId,
    );
  }

  private async loadEligibleFundOp(
    fundOpType: AccountingFundOpType,
    fundOpId: string,
  ): Promise<{
    organizationId: string;
    amountCents: number;
    currency: string;
    operationDate: string;
    reference: string | null;
    paymentMethod: string;
    source: string | null;
    fundOpType: AccountingFundOpType;
    fundOpId: string;
  }> {
    if (fundOpType === 'fund_entry') {
      const entry = await this.fundEntriesRepo.findOne({
        where: { id: fundOpId, deletedAt: IsNull() },
      });
      if (!entry) {
        throw new NotFoundException('Fund entry not found');
      }
      if (entry.status !== 'recorded') {
        throw new BadRequestException(
          'Fund entry must be recorded before accounting posting',
        );
      }
      return {
        organizationId: entry.organizationId,
        amountCents: entry.amountCents,
        currency: entry.currency,
        operationDate: entry.operationDate,
        reference: entry.reference,
        paymentMethod: entry.paymentMethod,
        source: entry.source,
        fundOpType,
        fundOpId,
      };
    }

    const exit = await this.fundExitsRepo.findOne({
      where: { id: fundOpId, deletedAt: IsNull() },
    });
    if (!exit) {
      throw new NotFoundException('Fund exit not found');
    }
    if (exit.status !== 'recorded') {
      throw new BadRequestException(
        'Fund exit must be recorded before accounting posting',
      );
    }
    return {
      organizationId: exit.organizationId,
      amountCents: exit.amountCents,
      currency: exit.currency,
      operationDate: exit.operationDate,
      reference: exit.reference,
      paymentMethod: exit.paymentMethod,
      source: null,
      fundOpType,
      fundOpId,
    };
  }

  private async assertFundOpExists(
    fundOpType: AccountingFundOpType,
    fundOpId: string,
    organizationId: string,
  ): Promise<void> {
    if (fundOpType === 'fund_entry') {
      const entry = await this.fundEntriesRepo.findOne({
        where: { id: fundOpId, deletedAt: IsNull() },
      });
      if (!entry) throw new NotFoundException('Fund entry not found');
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
    if (!exit) throw new NotFoundException('Fund exit not found');
    if (exit.organizationId !== organizationId) {
      throw new BadRequestException(
        'organizationId does not match the fund exit',
      );
    }
  }

  private linkSnapshot(row: AccountingLinks): Record<string, unknown> {
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
