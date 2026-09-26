import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { AccountingMappingRules } from '../../../entities/accounting-mapping-rule.entity';
import { ChartOfAccounts } from '../../../entities/chart-of-account.entity';
import type { AccountingFundOpType } from '../../../entities/accounting-link.entity';

export type MappingResolveContext = {
  organizationId: string;
  fundOpType: AccountingFundOpType;
  /** FundEntrySource — ignored for fund_exit */
  source?: string | null;
  paymentMethod: string;
};

export type ResolvedMappingRule = AccountingMappingRules & {
  debitAccountCode: string;
  creditAccountCode: string;
};

const SCHEMA_VERSION = 1;

/**
 * Moteur de résolution mapping trésorerie → plan SYSCOHADA (SYSCO-004).
 * Remplace le skeleton `TREASURY_ACCOUNTING_MAPPING_CONFIG`.
 */
@Injectable()
export class AccountingMappingEngine {
  constructor(
    @InjectRepository(AccountingMappingRules)
    private readonly rulesRepo: Repository<AccountingMappingRules>,
    @InjectRepository(ChartOfAccounts)
    private readonly accountsRepo: Repository<ChartOfAccounts>,
  ) {}

  get schemaVersion(): number {
    return SCHEMA_VERSION;
  }

  async listActiveRules(
    organizationId?: string,
  ): Promise<ResolvedMappingRule[]> {
    const qb = this.rulesRepo
      .createQueryBuilder('rule')
      .where('rule.deletedAt IS NULL')
      .andWhere('rule.isActive = :active', { active: true });

    if (organizationId) {
      qb.andWhere('rule.organizationId = :organizationId', { organizationId });
    }

    qb.orderBy('rule.fundOpType', 'ASC')
      .addOrderBy('rule.priority', 'DESC')
      .addOrderBy('rule.key', 'ASC');

    const rules = await qb.getMany();
    return this.enrichWithAccountCodes(rules);
  }

  /**
   * Résout la meilleure règle active pour une opération.
   * Score = (match_source ? 10 : 0) + (match_payment_method ? 10 : 0) + priority ;
   * tie-break : version max.
   */
  async resolve(ctx: MappingResolveContext): Promise<ResolvedMappingRule> {
    const candidates = await this.rulesRepo.find({
      where: {
        organizationId: ctx.organizationId,
        fundOpType: ctx.fundOpType,
        isActive: true,
        deletedAt: IsNull(),
      },
    });

    const matching = candidates.filter((rule) => {
      if (
        rule.matchSource != null &&
        rule.matchSource !== (ctx.source ?? null)
      ) {
        return false;
      }
      if (
        rule.matchPaymentMethod != null &&
        rule.matchPaymentMethod !== ctx.paymentMethod
      ) {
        return false;
      }
      return true;
    });

    if (matching.length === 0) {
      throw new BadRequestException(
        `No accounting mapping rule for ${ctx.fundOpType}` +
          (ctx.source ? ` source=${ctx.source}` : '') +
          ` payment_method=${ctx.paymentMethod}`,
      );
    }

    matching.sort((a, b) => {
      const scoreA = this.score(a);
      const scoreB = this.score(b);
      if (scoreB !== scoreA) return scoreB - scoreA;
      return b.version - a.version;
    });

    const best = matching[0]!;
    const [enriched] = await this.enrichWithAccountCodes([best]);
    return enriched!;
  }

  async findByKey(
    organizationId: string,
    key: string,
  ): Promise<AccountingMappingRules | null> {
    const rows = await this.rulesRepo.find({
      where: {
        organizationId,
        key,
        isActive: true,
        deletedAt: IsNull(),
      },
      order: { version: 'DESC' },
      take: 1,
    });
    return rows[0] ?? null;
  }

  private score(rule: AccountingMappingRules): number {
    return (
      (rule.matchSource != null ? 10 : 0) +
      (rule.matchPaymentMethod != null ? 10 : 0) +
      rule.priority
    );
  }

  private async enrichWithAccountCodes(
    rules: AccountingMappingRules[],
  ): Promise<ResolvedMappingRule[]> {
    if (rules.length === 0) return [];

    const accountIds = [
      ...new Set(
        rules.flatMap((r) => [r.debitAccountId, r.creditAccountId]),
      ),
    ];
    const accounts = await this.accountsRepo.find({
      where: { id: In(accountIds), deletedAt: IsNull() },
    });
    const codeById = new Map(accounts.map((a) => [a.id, a.code]));

    return rules.map((rule) => {
      const debitCode = codeById.get(rule.debitAccountId);
      const creditCode = codeById.get(rule.creditAccountId);
      if (!debitCode || !creditCode) {
        throw new NotFoundException(
          `Mapped account missing for rule ${rule.key}`,
        );
      }
      return Object.assign(rule, {
        debitAccountCode: debitCode,
        creditAccountCode: creditCode,
      });
    });
  }
}
