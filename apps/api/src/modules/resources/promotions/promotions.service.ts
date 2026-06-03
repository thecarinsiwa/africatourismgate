import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Promotions } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { PromotionsListQueryDto } from './dto/promotions-list-query.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionsService extends CrudService<Promotions> {
  constructor(
    @InjectRepository(Promotions)
    private readonly promotionsRepository: Repository<Promotions>,
  ) {
    super(promotionsRepository);
  }

  override async findAll(
    query: PromotionsListQueryDto,
  ): Promise<PaginatedResult<Promotions>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.promotionsRepository
      .createQueryBuilder('p')
      .where('p.deletedAt IS NULL');

    if (search) {
      const pattern = `%${search.toLowerCase()}%`;
      qb.andWhere(
        new Brackets((sub) => {
          sub
            .where('LOWER(p.name) LIKE :pattern', { pattern })
            .orWhere('LOWER(p.description) LIKE :pattern', { pattern });
        }),
      );
    }

    qb.orderBy('p.createdAt', 'DESC')
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

  async createPromotion(
    dto: CreatePromotionDto,
    actorUserId?: string,
  ): Promise<Promotions> {
    this.assertDateRange(dto.validFrom ?? null, dto.validUntil ?? null);
    this.assertDiscountPair(dto.discountType ?? null, dto.discountValue ?? null);

    if (dto.discountType && dto.discountValue != null) {
      this.assertDiscountValue(dto.discountType, dto.discountValue);
    }

    return super.create(
      {
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        discountType: dto.discountType ?? null,
        discountValue:
          dto.discountType && dto.discountValue != null
            ? String(dto.discountValue)
            : null,
        validFrom: dto.validFrom ?? null,
        validUntil: dto.validUntil ?? null,
        maxRedemptions: dto.maxRedemptions ?? null,
        redemptionCount: 0,
        active: dto.active,
      } as DeepPartial<Promotions>,
      actorUserId,
    );
  }

  async updatePromotion(
    id: string,
    dto: UpdatePromotionDto,
    actorUserId?: string,
  ): Promise<Promotions> {
    const existing = await this.findOne(id);
    const validFrom =
      dto.validFrom !== undefined ? dto.validFrom : existing.validFrom;
    const validUntil =
      dto.validUntil !== undefined ? dto.validUntil : existing.validUntil;
    this.assertDateRange(validFrom, validUntil);

    const discountType =
      dto.discountType !== undefined ? dto.discountType : existing.discountType;
    const discountValue =
      dto.discountValue !== undefined
        ? dto.discountValue
        : existing.discountValue != null
          ? Number(existing.discountValue)
          : null;
    this.assertDiscountPair(discountType, discountValue);

    if (discountType && discountValue != null) {
      this.assertDiscountValue(discountType, discountValue);
    }

    const patch: DeepPartial<Promotions> = {};
    if (dto.name !== undefined) patch.name = dto.name.trim();
    if (dto.description !== undefined) {
      patch.description = (dto.description?.trim() || null) as Promotions['description'];
    }
    if (dto.validFrom !== undefined) patch.validFrom = dto.validFrom;
    if (dto.validUntil !== undefined) patch.validUntil = dto.validUntil;
    if (dto.active !== undefined) patch.active = dto.active;
    if (dto.maxRedemptions !== undefined) {
      patch.maxRedemptions = (dto.maxRedemptions ?? null) as Promotions['maxRedemptions'];
    }
    if (dto.discountType !== undefined || dto.discountValue !== undefined) {
      patch.discountType = discountType;
      patch.discountValue =
        discountType && discountValue != null ? String(discountValue) : null;
    }

    return super.update(id, patch, actorUserId);
  }

  private assertDateRange(
    validFrom: string | null | undefined,
    validUntil: string | null | undefined,
  ): void {
    if (!validFrom || !validUntil) return;
    const from = this.toDateString(validFrom);
    const until = this.toDateString(validUntil);
    if (from > until) {
      throw new BadRequestException(
        'La date de fin doit être postérieure ou égale à la date de début.',
      );
    }
  }

  private assertDiscountPair(
    discountType: Promotions['discountType'],
    discountValue: number | null | undefined,
  ): void {
    const hasType = discountType != null;
    const hasValue = discountValue != null;
    if (hasType !== hasValue) {
      throw new BadRequestException(
        'Renseignez le type et la valeur de réduction, ou laissez les deux vides (campagne informative).',
      );
    }
  }

  private assertDiscountValue(
    discountType: NonNullable<Promotions['discountType']>,
    discountValue: number,
  ): void {
    if (!Number.isFinite(discountValue) || discountValue <= 0) {
      throw new BadRequestException('La valeur de réduction doit être positive.');
    }
    if (discountType === 'percent' && discountValue > 100) {
      throw new BadRequestException(
        'Le pourcentage de réduction ne peut pas dépasser 100.',
      );
    }
  }

  private toDateString(value: string | Date): string {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return String(value).slice(0, 10);
  }
}
