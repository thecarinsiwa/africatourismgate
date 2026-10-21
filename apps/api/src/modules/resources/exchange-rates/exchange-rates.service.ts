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
import { ExchangeRates } from '../../../entities/exchange-rate.entity';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import {
  ExchangeRateDto,
  toExchangeRateDto,
} from './dto/exchange-rate.dto';
import { ExchangeRatesListQueryDto } from './dto/exchange-rates-list-query.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

const CONFLICT_MESSAGE =
  'An exchange rate already exists for this organization, pair and effective date';

function dateOnly(value: string | Date): string {
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

export type ResolvedExchangeRate = {
  rate: number;
  effectiveOn: string;
  fromCurrency: string;
  toCurrency: string;
  exchangeRateId: string;
};

@Injectable()
export class ExchangeRatesService extends CrudService<ExchangeRates> {
  constructor(
    @InjectRepository(ExchangeRates)
    private readonly ratesRepo: Repository<ExchangeRates>,
  ) {
    super(ratesRepo);
  }

  override async findAll(
    query: ExchangeRatesListQueryDto,
  ): Promise<PaginatedResult<ExchangeRateDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.ratesRepo
      .createQueryBuilder('rate')
      .where('rate.deletedAt IS NULL');

    if (query.organizationId) {
      qb.andWhere('rate.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }
    if (query.fromCurrency) {
      qb.andWhere('rate.fromCurrency = :fromCurrency', {
        fromCurrency: query.fromCurrency.toUpperCase(),
      });
    }
    if (query.toCurrency) {
      qb.andWhere('rate.toCurrency = :toCurrency', {
        toCurrency: query.toCurrency.toUpperCase(),
      });
    }
    if (query.effectiveOnFrom) {
      qb.andWhere('rate.effectiveOn >= :effectiveOnFrom', {
        effectiveOnFrom: dateOnly(query.effectiveOnFrom),
      });
    }
    if (query.effectiveOnTo) {
      qb.andWhere('rate.effectiveOn <= :effectiveOnTo', {
        effectiveOnTo: dateOnly(query.effectiveOnTo),
      });
    }

    qb.orderBy('rate.effectiveOn', 'DESC')
      .addOrderBy('rate.fromCurrency', 'ASC')
      .addOrderBy('rate.toCurrency', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();
    return {
      data: rows.map(toExchangeRateDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  override async findOne(id: string): Promise<ExchangeRateDto> {
    const row = await this.requireRow(id);
    return toExchangeRateDto(row);
  }

  async createFromDto(
    dto: CreateExchangeRateDto,
    actorUserId?: string,
  ): Promise<ExchangeRateDto> {
    const fromCurrency = dto.fromCurrency.toUpperCase();
    const toCurrency = dto.toCurrency.toUpperCase();
    const effectiveOn = dateOnly(dto.effectiveOn);
    this.assertPair(fromCurrency, toCurrency, dto.rate);

    await this.assertUnique({
      organizationId: dto.organizationId,
      fromCurrency,
      toCurrency,
      effectiveOn,
    });

    try {
      const saved = await super.create(
        {
          organizationId: dto.organizationId,
          fromCurrency,
          toCurrency,
          rate: dto.rate,
          effectiveOn,
          notes: dto.notes?.trim() || null,
        } as DeepPartial<ExchangeRates>,
        actorUserId,
      );
      return toExchangeRateDto(saved);
    } catch (error) {
      this.rethrowDuplicate(error);
      throw error;
    }
  }

  async updateFromDto(
    id: string,
    dto: UpdateExchangeRateDto,
    actorUserId?: string,
  ): Promise<ExchangeRateDto> {
    const existing = await this.requireRow(id);
    const fromCurrency = (
      dto.fromCurrency ?? existing.fromCurrency
    ).toUpperCase();
    const toCurrency = (dto.toCurrency ?? existing.toCurrency).toUpperCase();
    const effectiveOn = dateOnly(dto.effectiveOn ?? existing.effectiveOn);
    const rate = dto.rate ?? existing.rate;
    this.assertPair(fromCurrency, toCurrency, rate);

    await this.assertUnique({
      organizationId: existing.organizationId,
      fromCurrency,
      toCurrency,
      effectiveOn,
      excludeId: id,
    });

    const payload: DeepPartial<ExchangeRates> = {
      fromCurrency,
      toCurrency,
      effectiveOn,
      rate,
    };
    if (dto.notes !== undefined) {
      payload.notes = dto.notes?.trim() || null;
    }

    try {
      const saved = await super.update(id, payload, actorUserId);
      return toExchangeRateDto(saved);
    } catch (error) {
      this.rethrowDuplicate(error);
      throw error;
    }
  }

  override async remove(id: string, actorUserId?: string): Promise<void> {
    await this.requireRow(id);
    await super.remove(id, actorUserId);
  }

  /**
   * Dernier taux avec effective_on ≤ onDate pour la paire (org, from → to).
   * Retourne null si aucun taux applicable (appelant : erreur métier au post).
   */
  async resolveRate(params: {
    organizationId: string;
    fromCurrency: string;
    toCurrency: string;
    onDate: string | Date;
  }): Promise<ResolvedExchangeRate | null> {
    const fromCurrency = params.fromCurrency.toUpperCase();
    const toCurrency = params.toCurrency.toUpperCase();
    if (fromCurrency === toCurrency) {
      return {
        rate: 1,
        effectiveOn: dateOnly(params.onDate),
        fromCurrency,
        toCurrency,
        exchangeRateId: '',
      };
    }

    const onDate = dateOnly(params.onDate);
    const row = await this.ratesRepo
      .createQueryBuilder('rate')
      .where('rate.deletedAt IS NULL')
      .andWhere('rate.organizationId = :organizationId', {
        organizationId: params.organizationId,
      })
      .andWhere('rate.fromCurrency = :fromCurrency', { fromCurrency })
      .andWhere('rate.toCurrency = :toCurrency', { toCurrency })
      .andWhere('rate.effectiveOn <= :onDate', { onDate })
      .orderBy('rate.effectiveOn', 'DESC')
      .getOne();

    if (!row) {
      return null;
    }

    return {
      rate: Number(row.rate),
      effectiveOn: dateOnly(row.effectiveOn),
      fromCurrency: row.fromCurrency,
      toCurrency: row.toCurrency,
      exchangeRateId: row.id,
    };
  }

  private async requireRow(id: string): Promise<ExchangeRates> {
    const row = await this.ratesRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Exchange rate not found');
    }
    return row;
  }

  private assertPair(
    fromCurrency: string,
    toCurrency: string,
    rate: number,
  ): void {
    if (fromCurrency === toCurrency) {
      throw new BadRequestException(
        'fromCurrency and toCurrency must be different',
      );
    }
    if (!(rate > 0) || !Number.isFinite(rate)) {
      throw new BadRequestException('rate must be a positive finite number');
    }
  }

  private async assertUnique(params: {
    organizationId: string;
    fromCurrency: string;
    toCurrency: string;
    effectiveOn: string;
    excludeId?: string;
  }): Promise<void> {
    const qb = this.ratesRepo
      .createQueryBuilder('rate')
      .where('rate.deletedAt IS NULL')
      .andWhere('rate.organizationId = :organizationId', {
        organizationId: params.organizationId,
      })
      .andWhere('rate.fromCurrency = :fromCurrency', {
        fromCurrency: params.fromCurrency,
      })
      .andWhere('rate.toCurrency = :toCurrency', {
        toCurrency: params.toCurrency,
      })
      .andWhere('rate.effectiveOn = :effectiveOn', {
        effectiveOn: params.effectiveOn,
      });
    if (params.excludeId) {
      qb.andWhere('rate.id != :excludeId', { excludeId: params.excludeId });
    }
    const existing = await qb.getOne();
    if (existing) {
      throw new ConflictException(CONFLICT_MESSAGE);
    }
  }

  private rethrowDuplicate(error: unknown): void {
    if (
      typeof error === 'object' &&
      error !== null &&
      'driverError' in error &&
      (error.driverError as { code?: string })?.code === 'ER_DUP_ENTRY'
    ) {
      throw new ConflictException(CONFLICT_MESSAGE);
    }
  }
}
