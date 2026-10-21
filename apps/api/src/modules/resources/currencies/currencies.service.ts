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
import { Currencies } from '../../../entities/currency.entity';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { CurrenciesListQueryDto } from './dto/currencies-list-query.dto';
import { CurrencyDto, toCurrencyDto } from './dto/currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';

const CONFLICT_MESSAGE =
  'A currency with this code already exists in the catalog';

const LAST_ACTIVE_MESSAGE =
  'Cannot deactivate or delete the last active currency';

@Injectable()
export class CurrenciesService {
  constructor(
    @InjectRepository(Currencies)
    private readonly currenciesRepo: Repository<Currencies>,
  ) {}

  async findAll(
    query: CurrenciesListQueryDto,
  ): Promise<PaginatedResult<CurrencyDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.currenciesRepo
      .createQueryBuilder('currency')
      .where('currency.deletedAt IS NULL');

    if (query.activeOnly === true) {
      qb.andWhere('currency.isActive = :isActive', { isActive: true });
    }

    const search = query.search?.trim();
    if (search) {
      qb.andWhere(
        '(currency.code LIKE :search OR currency.label LIKE :search)',
        { search: `%${search}%` },
      );
    }

    qb.orderBy('currency.sortOrder', 'ASC')
      .addOrderBy('currency.code', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    const [rows, total] = await qb.getManyAndCount();
    return {
      data: rows.map(toCurrencyDto),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: string): Promise<CurrencyDto> {
    return toCurrencyDto(await this.requireRow(id));
  }

  async createFromDto(
    dto: CreateCurrencyDto,
    actorUserId?: string,
  ): Promise<CurrencyDto> {
    const code = dto.code.trim().toUpperCase();
    const label = dto.label.trim();
    this.assertCode(code);
    if (!label) {
      throw new BadRequestException('label is required');
    }

    await this.assertUniqueCode(code);

    const decimalPlaces = dto.decimalPlaces ?? 2;
    this.assertDecimalPlaces(decimalPlaces);

    try {
      const entity = this.currenciesRepo.create({
        id: newId(),
        code,
        label,
        symbol: dto.symbol?.trim() || null,
        decimalPlaces,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
        createdByUserId: actorUserId ?? null,
      });
      const saved = await this.currenciesRepo.save(entity);
      return toCurrencyDto(saved);
    } catch (error) {
      this.rethrowDuplicate(error);
      throw error;
    }
  }

  async updateFromDto(
    id: string,
    dto: UpdateCurrencyDto,
    actorUserId?: string,
  ): Promise<CurrencyDto> {
    const existing = await this.requireRow(id);
    const nextCode = (dto.code ?? existing.code).trim().toUpperCase();
    const nextLabel = (dto.label ?? existing.label).trim();
    this.assertCode(nextCode);
    if (!nextLabel) {
      throw new BadRequestException('label cannot be empty');
    }

    const nextDecimalPlaces = dto.decimalPlaces ?? existing.decimalPlaces;
    this.assertDecimalPlaces(nextDecimalPlaces);

    const nextActive =
      dto.isActive !== undefined ? Boolean(dto.isActive) : existing.isActive;
    if (existing.isActive && !nextActive) {
      await this.assertNotLastActive(id);
    }

    await this.assertUniqueCode(nextCode, id);

    existing.code = nextCode;
    existing.label = nextLabel;
    existing.decimalPlaces = nextDecimalPlaces;
    existing.isActive = nextActive;
    existing.updatedByUserId = actorUserId ?? null;
    if (dto.symbol !== undefined) {
      existing.symbol = dto.symbol?.trim() || null;
    }
    if (dto.sortOrder !== undefined) {
      existing.sortOrder = dto.sortOrder;
    }

    try {
      const saved = await this.currenciesRepo.save(existing);
      return toCurrencyDto(saved);
    } catch (error) {
      this.rethrowDuplicate(error);
      throw error;
    }
  }

  async remove(id: string, actorUserId?: string): Promise<void> {
    const row = await this.requireRow(id);
    if (row.isActive) {
      await this.assertNotLastActive(id);
    }
    await this.currenciesRepo.softDelete(id);
    if (actorUserId) {
      await this.currenciesRepo.update(id, { deletedByUserId: actorUserId });
    }
  }

  /** True if an active (non-deleted) currency exists for this ISO code. */
  async isActiveCode(code: string): Promise<boolean> {
    const normalized = code.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(normalized)) return false;
    const count = await this.currenciesRepo.count({
      where: {
        code: normalized,
        isActive: true,
        deletedAt: IsNull(),
      },
    });
    return count > 0;
  }

  async assertActiveCode(code: string): Promise<string> {
    const normalized = code.trim().toUpperCase();
    this.assertCode(normalized);
    if (!(await this.isActiveCode(normalized))) {
      throw new BadRequestException(
        `Currency ${normalized} is not in the active platform catalog`,
      );
    }
    return normalized;
  }

  private async requireRow(id: string): Promise<Currencies> {
    const row = await this.currenciesRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!row) {
      throw new NotFoundException('Currency not found');
    }
    return row;
  }

  private assertCode(code: string): void {
    if (!/^[A-Z]{3}$/.test(code)) {
      throw new BadRequestException('code must be a 3-letter ISO 4217 code');
    }
  }

  private assertDecimalPlaces(value: number): void {
    if (!Number.isInteger(value) || value < 0 || value > 6) {
      throw new BadRequestException('decimalPlaces must be an integer 0–6');
    }
  }

  private async assertUniqueCode(
    code: string,
    excludeId?: string,
  ): Promise<void> {
    const qb = this.currenciesRepo
      .createQueryBuilder('currency')
      .where('currency.deletedAt IS NULL')
      .andWhere('currency.code = :code', { code });
    if (excludeId) {
      qb.andWhere('currency.id != :excludeId', { excludeId });
    }
    const existing = await qb.getOne();
    if (existing) {
      throw new ConflictException(CONFLICT_MESSAGE);
    }
  }

  private async assertNotLastActive(excludeId: string): Promise<void> {
    const active = await this.currenciesRepo.find({
      where: { isActive: true, deletedAt: IsNull() },
    });
    if (active.length === 1 && active[0]?.id === excludeId) {
      throw new BadRequestException(LAST_ACTIVE_MESSAGE);
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
