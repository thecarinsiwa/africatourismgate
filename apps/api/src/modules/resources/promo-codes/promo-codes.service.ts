import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { PromoCodes } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { CreatePromoCodeDto } from './dto/create-promo-code.dto';
import { PromoCodesListQueryDto } from './dto/promo-codes-list-query.dto';
import { UpdatePromoCodeDto } from './dto/update-promo-code.dto';

@Injectable()
export class PromoCodesService extends CrudService<PromoCodes> {
  constructor(
    @InjectRepository(PromoCodes)
    private readonly promoCodesRepository: Repository<PromoCodes>,
  ) {
    super(promoCodesRepository);
  }

  override async findAll(
    query: PromoCodesListQueryDto,
  ): Promise<PaginatedResult<PromoCodes>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const search = query.search?.trim();

    const qb = this.promoCodesRepository
      .createQueryBuilder('pc')
      .where('pc.deletedAt IS NULL');

    if (search) {
      const pattern = `%${search.toUpperCase()}%`;
      qb.andWhere('UPPER(pc.code) LIKE :pattern', { pattern });
    }

    qb.orderBy('pc.createdAt', 'DESC')
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

  async createPromoCode(
    dto: CreatePromoCodeDto,
    actorUserId?: string,
  ): Promise<PromoCodes> {
    const code = this.normalizeCode(dto.code);
    this.assertDateRange(dto.validFrom, dto.validUntil);
    this.assertDiscountValue(dto.discountType, dto.discountValue);
    await this.assertCodeAvailable(code);

    return super.create(
      {
        code,
        discountType: dto.discountType,
        discountValue: String(dto.discountValue),
        validFrom: dto.validFrom,
        validUntil: dto.validUntil,
        maxRedemptions: dto.maxRedemptions ?? null,
        redemptionCount: 0,
        active: dto.active,
      } as DeepPartial<PromoCodes>,
      actorUserId,
    );
  }

  async updatePromoCode(
    id: string,
    dto: UpdatePromoCodeDto,
    actorUserId?: string,
  ): Promise<PromoCodes> {
    const existing = await this.findOne(id);
    const validFrom = dto.validFrom ?? this.toDateString(existing.validFrom);
    const validUntil = dto.validUntil ?? this.toDateString(existing.validUntil);
    this.assertDateRange(validFrom, validUntil);

    const discountType = dto.discountType ?? existing.discountType;
    const discountValue =
      dto.discountValue ?? Number(existing.discountValue);
    this.assertDiscountValue(discountType, discountValue);

    const patch: DeepPartial<PromoCodes> = {};
    if (dto.discountType !== undefined) patch.discountType = dto.discountType;
    if (dto.validFrom !== undefined) patch.validFrom = dto.validFrom;
    if (dto.validUntil !== undefined) patch.validUntil = dto.validUntil;
    if (dto.active !== undefined) patch.active = dto.active;
    if (dto.discountValue !== undefined) {
      patch.discountValue = String(dto.discountValue);
    }
    if (dto.maxRedemptions !== undefined) {
      patch.maxRedemptions = (dto.maxRedemptions ?? null) as PromoCodes['maxRedemptions'];
    }
    if (dto.code !== undefined) {
      patch.code = this.normalizeCode(dto.code);
      await this.assertCodeAvailable(patch.code, id);
    }

    return super.update(id, patch, actorUserId);
  }

  private normalizeCode(code: string): string {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      throw new BadRequestException('Le code est obligatoire.');
    }
    if (!/^[A-Z0-9_-]+$/.test(normalized)) {
      throw new BadRequestException(
        'Code invalide : lettres majuscules, chiffres, tirets et underscores uniquement.',
      );
    }
    return normalized;
  }

  private assertDateRange(validFrom: string, validUntil: string): void {
    const from = this.toDateString(validFrom);
    const until = this.toDateString(validUntil);
    if (from > until) {
      throw new BadRequestException(
        'La date de fin doit être postérieure ou égale à la date de début.',
      );
    }
  }

  private assertDiscountValue(
    discountType: PromoCodes['discountType'],
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

  private async assertCodeAvailable(code: string, excludeId?: string): Promise<void> {
    const qb = this.promoCodesRepository
      .createQueryBuilder('pc')
      .where('pc.deletedAt IS NULL')
      .andWhere('UPPER(pc.code) = :code', { code });

    if (excludeId) {
      qb.andWhere('pc.id != :excludeId', { excludeId });
    }

    const existing = await qb.getOne();
    if (existing) {
      throw new ConflictException(`Le code promo « ${code} » existe déjà.`);
    }
  }

  private toDateString(value: string | Date): string {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return String(value).slice(0, 10);
  }
}
