import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, IsNull, Repository } from 'typeorm';
import { CrudService } from '../../../common/crud/crud.service';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import {
  Budgets,
  BudgetPeriodType,
  BudgetProductType,
  BudgetScopeType,
} from '../../../entities/budget.entity';
import { FundExits } from '../../../entities/fund-exit.entity';
import {
  Activities,
  ActivitySchedules,
  Cabins,
  FlightClasses,
  Packages,
  Rooms,
  Vehicles,
} from '../../../entities/generated';
import { BudgetsListQueryDto } from './dto/budgets-list-query.dto';
import { BudgetsVsActualQueryDto } from './dto/budgets-vs-actual-query.dto';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

const BUDGET_CONFLICT_MESSAGE =
  'A budget already exists for this organization, period, scope and currency';

/** Sorties comptées dans le « réalisé » (décaissées ou justifiées). */
const REALIZED_EXIT_STATUSES = ['disbursed', 'recorded'] as const;

type ResolvedScope = {
  scopeType: BudgetScopeType;
  activityId: string | null;
  productType: BudgetProductType | null;
  productId: string | null;
};

export type BudgetVsActualRow = {
  budgetId: string;
  label: string;
  periodType: BudgetPeriodType;
  year: number;
  month: number | null;
  currency: string;
  scopeType: BudgetScopeType;
  organizationId: string;
  plannedCents: number;
  actualCents: number;
  varianceCents: number;
  overBudget: boolean;
  dateFrom: string;
  dateTo: string;
};

export type BudgetVsActualSummary = {
  year: number;
  month: number | null;
  currency: string | null;
  organizationId: string | null;
  periodType: BudgetPeriodType | null;
  rows: BudgetVsActualRow[];
  totals: {
    plannedCents: number;
    actualCents: number;
    varianceCents: number;
    overBudgetCount: number;
  };
};

@Injectable()
export class BudgetsService extends CrudService<Budgets> {
  constructor(
    @InjectRepository(Budgets)
    private readonly budgetsRepository: Repository<Budgets>,
    @InjectRepository(FundExits)
    private readonly fundExitsRepository: Repository<FundExits>,
    @InjectRepository(Activities)
    private readonly activitiesRepository: Repository<Activities>,
    @InjectRepository(ActivitySchedules)
    private readonly activitySchedulesRepository: Repository<ActivitySchedules>,
    @InjectRepository(Packages)
    private readonly packagesRepository: Repository<Packages>,
    @InjectRepository(Rooms)
    private readonly roomsRepository: Repository<Rooms>,
    @InjectRepository(FlightClasses)
    private readonly flightClassesRepository: Repository<FlightClasses>,
    @InjectRepository(Vehicles)
    private readonly vehiclesRepository: Repository<Vehicles>,
    @InjectRepository(Cabins)
    private readonly cabinsRepository: Repository<Cabins>,
  ) {
    super(budgetsRepository);
  }

  async createFromDto(
    dto: CreateBudgetDto,
    actorUserId?: string,
  ): Promise<Budgets> {
    this.assertPeriodFields(dto.periodType, dto.month);

    const month = dto.periodType === 'annual' ? null : (dto.month as number);
    const currency = dto.currency.toUpperCase();
    const scope = await this.resolveAndValidateScope({
      organizationId: dto.organizationId,
      scopeType: dto.scopeType ?? 'general',
      activityId: dto.activityId,
      productType: dto.productType,
      productId: dto.productId,
    });

    await this.assertUniqueBudget({
      organizationId: dto.organizationId,
      periodType: dto.periodType,
      year: dto.year,
      month,
      currency,
      ...scope,
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
          scopeType: scope.scopeType,
          activityId: scope.activityId,
          productType: scope.productType,
          productId: scope.productId,
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

    const periodType = dto.periodType ?? existing.periodType;
    const year = dto.year ?? existing.year;
    const monthInput = dto.month !== undefined ? dto.month : existing.month;
    this.assertPeriodFields(periodType, monthInput);

    const month = periodType === 'annual' ? null : (monthInput as number);
    const currency = (dto.currency ?? existing.currency).toUpperCase();

    const scope = await this.resolveAndValidateScope({
      organizationId: existing.organizationId,
      scopeType: dto.scopeType ?? existing.scopeType,
      activityId:
        dto.activityId !== undefined ? dto.activityId : existing.activityId,
      productType:
        dto.productType !== undefined ? dto.productType : existing.productType,
      productId:
        dto.productId !== undefined ? dto.productId : existing.productId,
    });

    await this.assertUniqueBudget({
      organizationId: existing.organizationId,
      periodType,
      year,
      month,
      currency,
      ...scope,
      excludeId: id,
    });

    const payload: DeepPartial<Budgets> = {
      periodType,
      year,
      month,
      currency,
      scopeType: scope.scopeType,
      activityId: scope.activityId,
      productType: scope.productType,
      productId: scope.productId,
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
    if (query.activityId) {
      qb.andWhere('budget.activityId = :activityId', {
        activityId: query.activityId,
      });
    }
    if (query.productType) {
      qb.andWhere('budget.productType = :productType', {
        productType: query.productType,
      });
    }
    if (query.productId) {
      qb.andWhere('budget.productId = :productId', {
        productId: query.productId,
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

  /**
   * Agrégat léger budget vs réalisé (sorties disbursed|recorded).
   * Pas de compta SYSCOHADA — somme des fund_exits sur la fenêtre du budget.
   */
  async getVsActualSummary(
    query: BudgetsVsActualQueryDto,
  ): Promise<BudgetVsActualSummary> {
    const year = query.year;
    const month = query.month ?? null;
    const currency = query.currency?.toUpperCase() ?? null;
    const organizationId = query.organizationId ?? null;
    const periodType = query.periodType ?? null;

    const qb = this.budgetsRepository
      .createQueryBuilder('budget')
      .where('budget.deletedAt IS NULL')
      .andWhere('budget.year = :year', { year });

    if (organizationId) {
      qb.andWhere('budget.organizationId = :organizationId', {
        organizationId,
      });
    }
    if (currency) {
      qb.andWhere('budget.currency = :currency', { currency });
    }
    if (periodType) {
      qb.andWhere('budget.periodType = :periodType', { periodType });
    }
    if (month != null) {
      // Filtre mois : budgets mensuels de ce mois uniquement
      qb.andWhere('budget.periodType = :monthly', { monthly: 'monthly' });
      qb.andWhere('budget.month = :month', { month });
    }

    qb.orderBy('budget.currency', 'ASC')
      .addOrderBy('budget.periodType', 'ASC')
      .addOrderBy('budget.month', 'ASC')
      .addOrderBy('budget.label', 'ASC');

    const budgets = await qb.getMany();

    const actualCache = new Map<string, number>();
    const rows: BudgetVsActualRow[] = [];

    for (const budget of budgets) {
      const { dateFrom, dateTo } = this.budgetDateWindow(budget);
      const cacheKey = [
        budget.organizationId,
        budget.currency,
        dateFrom,
        dateTo,
      ].join('|');

      let actualCents = actualCache.get(cacheKey);
      if (actualCents === undefined) {
        actualCents = await this.sumRealizedExits({
          organizationId: budget.organizationId,
          currency: budget.currency,
          dateFrom,
          dateTo,
        });
        actualCache.set(cacheKey, actualCents);
      }

      const plannedCents = budget.amountCents;
      const varianceCents = plannedCents - actualCents;
      rows.push({
        budgetId: budget.id,
        label: budget.label,
        periodType: budget.periodType,
        year: budget.year,
        month: budget.month,
        currency: budget.currency,
        scopeType: budget.scopeType,
        organizationId: budget.organizationId,
        plannedCents,
        actualCents,
        varianceCents,
        overBudget: actualCents > plannedCents,
        dateFrom,
        dateTo,
      });
    }

    // Totaux : prévu = somme des lignes ; réalisé = somme distincte des fenêtres
    // (évite de compter deux fois les mêmes sorties si plusieurs budgets partagent
    // la même fenêtre org/devise/dates).
    const plannedCents = rows.reduce((sum, r) => sum + r.plannedCents, 0);
    const uniqueActual = [...actualCache.values()].reduce(
      (sum, v) => sum + v,
      0,
    );
    // Si plusieurs org/devises : uniqueActual est la somme des fenêtres distinctes.
    const actualCents = uniqueActual;
    const overBudgetCount = rows.filter((r) => r.overBudget).length;

    return {
      year,
      month,
      currency,
      organizationId,
      periodType,
      rows,
      totals: {
        plannedCents,
        actualCents,
        varianceCents: plannedCents - actualCents,
        overBudgetCount,
      },
    };
  }

  private budgetDateWindow(budget: Budgets): {
    dateFrom: string;
    dateTo: string;
  } {
    if (budget.periodType === 'monthly' && budget.month != null) {
      const y = budget.year;
      const m = budget.month;
      const lastDay = new Date(y, m, 0).getDate();
      const pad = (n: number) => String(n).padStart(2, '0');
      return {
        dateFrom: `${y}-${pad(m)}-01`,
        dateTo: `${y}-${pad(m)}-${pad(lastDay)}`,
      };
    }
    return {
      dateFrom: `${budget.year}-01-01`,
      dateTo: `${budget.year}-12-31`,
    };
  }

  private async sumRealizedExits(params: {
    organizationId: string;
    currency: string;
    dateFrom: string;
    dateTo: string;
  }): Promise<number> {
    const raw = await this.fundExitsRepository
      .createQueryBuilder('exit')
      .select('COALESCE(SUM(exit.amountCents), 0)', 'total')
      .where('exit.deletedAt IS NULL')
      .andWhere('exit.organizationId = :organizationId', {
        organizationId: params.organizationId,
      })
      .andWhere('exit.currency = :currency', { currency: params.currency })
      .andWhere('exit.status IN (:...statuses)', {
        statuses: [...REALIZED_EXIT_STATUSES],
      })
      .andWhere('exit.operationDate >= :dateFrom', {
        dateFrom: params.dateFrom,
      })
      .andWhere('exit.operationDate <= :dateTo', { dateTo: params.dateTo })
      .getRawOne<{ total: string | number }>();

    const total = raw?.total ?? 0;
    return typeof total === 'string' ? Number.parseInt(total, 10) || 0 : total;
  }

  private async resolveAndValidateScope(input: {
    organizationId: string;
    scopeType: BudgetScopeType;
    activityId?: string | null;
    productType?: BudgetProductType | null;
    productId?: string | null;
  }): Promise<ResolvedScope> {
    const scopeType = input.scopeType ?? 'general';

    if (scopeType === 'general') {
      if (input.activityId || input.productType || input.productId) {
        throw new BadRequestException(
          'activityId / productType / productId must be omitted when scopeType is general',
        );
      }
      return {
        scopeType: 'general',
        activityId: null,
        productType: null,
        productId: null,
      };
    }

    if (scopeType === 'activity') {
      const activityId = input.activityId?.trim() || null;
      if (!activityId) {
        throw new BadRequestException(
          'activityId is required when scopeType is activity',
        );
      }
      if (input.productType || input.productId) {
        throw new BadRequestException(
          'productType / productId must be omitted when scopeType is activity',
        );
      }
      await this.assertActivityExists(activityId, input.organizationId);
      return {
        scopeType: 'activity',
        activityId,
        productType: null,
        productId: null,
      };
    }

    // product
    const productType = input.productType ?? null;
    const productId = input.productId?.trim() || null;
    if (!productType || !productId) {
      throw new BadRequestException(
        'productType and productId are required when scopeType is product',
      );
    }
    if (input.activityId) {
      throw new BadRequestException(
        'activityId must be omitted when scopeType is product',
      );
    }
    await this.assertProductExists(productType, productId);
    return {
      scopeType: 'product',
      activityId: null,
      productType,
      productId,
    };
  }

  private async assertActivityExists(
    activityId: string,
    organizationId: string,
  ): Promise<void> {
    const activity = await this.activitiesRepository.findOne({
      where: { id: activityId, deletedAt: IsNull() },
    });
    if (!activity) {
      throw new NotFoundException(`Activity ${activityId} not found`);
    }
    if (
      activity.organizationId != null &&
      activity.organizationId !== organizationId
    ) {
      throw new BadRequestException(
        'activityId does not belong to the budget organization',
      );
    }
  }

  private async assertProductExists(
    productType: BudgetProductType,
    productId: string,
  ): Promise<void> {
    let found: { id: string } | null = null;
    switch (productType) {
      case 'room':
        found = await this.roomsRepository.findOne({
          where: { id: productId, deletedAt: IsNull() },
          select: ['id'],
        });
        break;
      case 'flight_class':
        found = await this.flightClassesRepository.findOne({
          where: { id: productId, deletedAt: IsNull() },
          select: ['id'],
        });
        break;
      case 'vehicle':
        found = await this.vehiclesRepository.findOne({
          where: { id: productId, deletedAt: IsNull() },
          select: ['id'],
        });
        break;
      case 'cabin':
        found = await this.cabinsRepository.findOne({
          where: { id: productId, deletedAt: IsNull() },
          select: ['id'],
        });
        break;
      case 'activity_schedule':
        found = await this.activitySchedulesRepository.findOne({
          where: { id: productId, deletedAt: IsNull() },
          select: ['id'],
        });
        break;
      case 'package':
        found = await this.packagesRepository.findOne({
          where: { id: productId, deletedAt: IsNull() },
          select: ['id'],
        });
        break;
      default:
        throw new BadRequestException(`Unsupported productType: ${productType}`);
    }
    if (!found) {
      throw new NotFoundException(
        `Product ${productType}/${productId} not found`,
      );
    }
  }

  private assertPeriodFields(
    periodType: BudgetPeriodType,
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

  private async assertUniqueBudget(params: {
    organizationId: string;
    periodType: BudgetPeriodType;
    year: number;
    month: number | null;
    currency: string;
    scopeType: BudgetScopeType;
    activityId: string | null;
    productType: BudgetProductType | null;
    productId: string | null;
    excludeId?: string;
  }): Promise<void> {
    const qb = this.budgetsRepository
      .createQueryBuilder('budget')
      .where('budget.deletedAt IS NULL')
      .andWhere('budget.organizationId = :organizationId', {
        organizationId: params.organizationId,
      })
      .andWhere('budget.periodType = :periodType', {
        periodType: params.periodType,
      })
      .andWhere('budget.year = :year', { year: params.year })
      .andWhere('budget.currency = :currency', { currency: params.currency })
      .andWhere('budget.scopeType = :scopeType', {
        scopeType: params.scopeType,
      });

    if (params.month == null) {
      qb.andWhere('budget.month IS NULL');
    } else {
      qb.andWhere('budget.month = :month', { month: params.month });
    }

    if (params.activityId == null) {
      qb.andWhere('budget.activityId IS NULL');
    } else {
      qb.andWhere('budget.activityId = :activityId', {
        activityId: params.activityId,
      });
    }

    if (params.productType == null) {
      qb.andWhere('budget.productType IS NULL');
    } else {
      qb.andWhere('budget.productType = :productType', {
        productType: params.productType,
      });
    }

    if (params.productId == null) {
      qb.andWhere('budget.productId IS NULL');
    } else {
      qb.andWhere('budget.productId = :productId', {
        productId: params.productId,
      });
    }

    if (params.excludeId) {
      qb.andWhere('budget.id != :excludeId', { excludeId: params.excludeId });
    }

    const existing = await qb.getOne();
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
