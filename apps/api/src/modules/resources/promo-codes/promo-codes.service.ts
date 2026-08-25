import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, QueryFailedError, Repository, SelectQueryBuilder } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { PromoCodes } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { PromoCodesListQueryDto } from './dto/promo-codes-list-query.dto';

const PROMO_CODE_CONFLICT_MESSAGE = 'Ce code promo existe déjà.';

@Injectable()
export class PromoCodesService extends CrudService<PromoCodes> {
  constructor(
    @InjectRepository(PromoCodes)
    private readonly promoCodesRepository: Repository<PromoCodes>,
  ) {
    super(promoCodesRepository);
  }

  async list(query: PromoCodesListQueryDto): Promise<PaginatedResult<PromoCodes>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.promoCodesRepository
      .createQueryBuilder('promoCode')
      .where('promoCode.deletedAt IS NULL');

    const search = query.search?.trim();
    if (search) {
      qb.andWhere('promoCode.code LIKE :term', { term: `%${search}%` });
    }

    if (query.active !== undefined) {
      qb.andWhere('promoCode.active = :active', { active: query.active ? 1 : 0 });
    }

    this.applyValidityFilter(qb, query.validity);

    qb.orderBy('promoCode.createdAt', 'DESC')
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

  private applyValidityFilter(
    qb: SelectQueryBuilder<PromoCodes>,
    validity?: PromoCodesListQueryDto['validity'],
  ): void {
    if (!validity) return;

    if (validity === 'ongoing') {
      qb.andWhere(
        'promoCode.validFrom <= CURRENT_DATE() AND promoCode.validUntil >= CURRENT_DATE()',
      );
      return;
    }

    if (validity === 'upcoming') {
      qb.andWhere('promoCode.validFrom > CURRENT_DATE()');
      return;
    }

    qb.andWhere('promoCode.validUntil < CURRENT_DATE()');
  }

  async create(dto: DeepPartial<PromoCodes>, actorUserId?: string): Promise<PromoCodes> {
    const payload = this.normalizeCoverImage(dto);
    if (payload.code != null) {
      await this.assertCodeAvailable(String(payload.code));
    }
    try {
      return await super.create(payload, actorUserId);
    } catch (error) {
      this.rethrowDuplicateCode(error);
      throw error;
    }
  }

  async update(
    id: string,
    dto: DeepPartial<PromoCodes>,
    actorUserId?: string,
  ): Promise<PromoCodes> {
    const payload = this.normalizeCoverImage(dto);
    if (payload.code != null) {
      await this.assertCodeAvailable(String(payload.code), id);
    }
    try {
      return await super.update(id, payload, actorUserId);
    } catch (error) {
      this.rethrowDuplicateCode(error);
      throw error;
    }
  }

  private normalizeCoverImage(dto: DeepPartial<PromoCodes>): DeepPartial<PromoCodes> {
    if (dto.coverImageUrl === undefined) return dto;
    const trimmed = typeof dto.coverImageUrl === 'string' ? dto.coverImageUrl.trim() : '';
    return { ...dto, coverImageUrl: trimmed || null };
  }

  private async assertCodeAvailable(code: string, excludeId?: string): Promise<void> {
    const normalized = code.trim().toUpperCase();
    const qb = this.promoCodesRepository
      .createQueryBuilder('promoCode')
      .where('UPPER(promoCode.code) = :code', { code: normalized })
      .andWhere('promoCode.deletedAt IS NULL');

    if (excludeId) {
      qb.andWhere('promoCode.id != :excludeId', { excludeId });
    }

    const existing = await qb.getOne();
    if (existing) {
      throw new ConflictException(PROMO_CODE_CONFLICT_MESSAGE);
    }
  }

  private rethrowDuplicateCode(error: unknown): void {
    if (
      error instanceof QueryFailedError &&
      (error.driverError as { code?: string })?.code === 'ER_DUP_ENTRY'
    ) {
      throw new ConflictException(PROMO_CODE_CONFLICT_MESSAGE);
    }
  }
}
