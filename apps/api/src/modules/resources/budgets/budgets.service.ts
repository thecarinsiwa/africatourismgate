import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, IsNull, Not, Repository } from 'typeorm';
import { CrudService } from '../../../common/crud/crud.service';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Budgets } from '../../../entities/budget.entity';
import { BudgetsListQueryDto } from './dto/budgets-list-query.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

const BUDGET_CONFLICT_MESSAGE =
  'A budget already exists for this organization, period and currency';

@Injectable()
export class BudgetsService extends CrudService<Budgets> {
  constructor(
    @InjectRepository(Budgets)
    private readonly budgetsRepository: Repository<Budgets>,
  ) {
    super(budgetsRepository);
  }

  async createFromDto(
    dto: CreateBudgetDto,
    actorUserId?: string,
  ): Promise<Budgets> {
    this.assertPeriodFields(dto.periodType, dto.month);
    this.assertGeneralScopeOnly(dto.scopeType);

    const month = dto.periodType === 'annual' ? null : (dto.month as number);
    const currency = dto.currency.toUpperCase();

    await this.assertUniquePeriod({
      organizationId: dto.organizationId,
      periodType: dto.periodType,
      year: dto.year,
      month,
      currency,
    });

    try {
      return await super.create(
        {
          organizationId: dto.organizationId,
          label: dto.label.trim(),
          periodType: dto.periodType,
          year: dto.year,
          month,
          amountCents: dto.amountCents,
          currency,
          scopeType: 'general',
          activityId: null,
          productType: null,
          productId: null,
          notes: dto.notes?.trim() || null,
        } as DeepPartial<Budgets>,
        actorUserId,
      );
    } catch (error) {
      this.rethrowDuplicate(error);
      throw error;
    }
  }

  async updateFromDto(
    id: string,
    dto: UpdateBudgetDto,
    actorUserId?: string,
  ): Promise<Budgets> {
    const existing = await this.findOne(id);

    if (dto.scopeType !== undefined) {
      this.assertGeneralScopeOnly(dto.scopeType);
    }

    const periodType = dto.periodType ?? existing.periodType;
    const year = dto.year ?? existing.year;
    const monthInput =
      dto.month !== undefined ? dto.month : existing.month;
    this.assertPeriodFields(periodType, monthInput);

    const month = periodType === 'annual' ? null : (monthInput as number);
    const currency = (dto.currency ?? existing.currency).toUpperCase();

    await this.assertUniquePeriod({
      organizationId: existing.organizationId,
      periodType,
      year,
      month,
      currency,
      excludeId: id,
    });

    const payload: DeepPartial<Budgets> = {
      scopeType: 'general',
      activityId: null,
      productType: null,
      productId: null,
      periodType,
      year,
      month,
      currency,
    };
    if (dto.label !== undefined) {
      payload.label = dto.label.trim();
    }
    if (dto.amountCents !== undefined) {
      payload.amountCents = dto.amountCents;
    }
    if (dto.notes !== undefined) {
      payload.notes = dto.notes?.trim() || null;
    }

    try {
      return await super.update(id, payload, actorUserId);
    } catch (error) {
      this.rethrowDuplicate(error);
      throw error;
    }
  }

  override async findAll(
    query: BudgetsListQueryDto,
  ): Promise<PaginatedResult<Budgets>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.budgetsRepository
      .createQueryBuilder('budget')
      .where('budget.deletedAt IS NULL');

    if (query.organizationId) {
      qb.andWhere('budget.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }
    if (query.periodType) {
      qb.andWhere('budget.periodType = :periodType', {
        periodType: query.periodType,
      });
    }
    if (query.year != null) {
      qb.andWhere('budget.year = :year', { year: query.year });
    }
    if (query.month != null) {
      qb.andWhere('budget.month = :month', { month: query.month });
    }
    if (query.scopeType) {
      qb.andWhere('budget.scopeType = :scopeType', {
        scopeType: query.scopeType,
      });
    }
    if (query.currency) {
      qb.andWhere('budget.currency = :currency', {
        currency: query.currency.toUpperCase(),
      });
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('(budget.label LIKE :term OR budget.notes LIKE :term)', {
        term: `%${search}%`,
      });
    }

    qb.orderBy('budget.year', 'DESC')
      .addOrderBy('budget.month', 'DESC')
      .addOrderBy('budget.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await qb.getManyAndCount();

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

  private assertGeneralScopeOnly(scopeType: string | undefined): void {
    if (scopeType != null && scopeType !== 'general') {
      throw new BadRequestException(
        'Activity/product budget scopes are not available yet (TRESO-024). Use scopeType=general.',
      );
    }
  }

  private assertPeriodFields(
    periodType: 'monthly' | 'annual',
    month: number | null | undefined,
  ): void {
    if (periodType === 'monthly') {
      if (month == null || month < 1 || month > 12) {
        throw new BadRequestException(
          'month (1–12) is required when periodType is monthly',
        );
      }
      return;
    }
    if (month != null) {
      throw new BadRequestException(
        'month must be null when periodType is annual',
      );
    }
  }

  private async assertUniquePeriod(params: {
    organizationId: string;
    periodType: 'monthly' | 'annual';
    year: number;
    month: number | null;
    currency: string;
    excludeId?: string;
  }): Promise<void> {
    const where =
      params.month == null
        ? {
            organizationId: params.organizationId,
            periodType: params.periodType,
            year: params.year,
            month: IsNull(),
            scopeType: 'general' as const,
            currency: params.currency,
            deletedAt: IsNull(),
            ...(params.excludeId ? { id: Not(params.excludeId) } : {}),
          }
        : {
            organizationId: params.organizationId,
            periodType: params.periodType,
            year: params.year,
            month: params.month,
            scopeType: 'general' as const,
            currency: params.currency,
            deletedAt: IsNull(),
            ...(params.excludeId ? { id: Not(params.excludeId) } : {}),
          };

    const existing = await this.budgetsRepository.findOne({ where });
    if (existing) {
      throw new ConflictException(BUDGET_CONFLICT_MESSAGE);
    }
  }

  private rethrowDuplicate(error: unknown): void {
    if (
      typeof error === 'object' &&
      error !== null &&
      'driverError' in error &&
      (error.driverError as { code?: string })?.code === 'ER_DUP_ENTRY'
    ) {
      throw new ConflictException(BUDGET_CONFLICT_MESSAGE);
    }
  }
}
