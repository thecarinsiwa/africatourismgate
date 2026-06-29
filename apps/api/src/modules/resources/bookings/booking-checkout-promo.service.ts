import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PromoCodes, Promotions, Bookings } from '../../../entities/generated';
import { BookingCheckoutDto } from './dto/booking-checkout.dto';

export type AppliedCheckoutDiscount = {
  kind: 'promo_code' | 'promotion';
  id: string;
  label: string;
  discountType: 'percent' | 'fixed_amount';
  discountValue: number;
  discountCents: number;
  promoCodeId: string | null;
  promotionId: string | null;
};

@Injectable()
export class BookingCheckoutPromoService {
  constructor(
    @InjectRepository(PromoCodes)
    private readonly promoCodesRepository: Repository<PromoCodes>,
    @InjectRepository(Promotions)
    private readonly promotionsRepository: Repository<Promotions>,
  ) {}

  async resolveDiscount(
    dto: BookingCheckoutDto,
    subtotalCents: number,
  ): Promise<AppliedCheckoutDiscount | null> {
    const promoCode = dto.promoCode?.trim();
    const promotionId = dto.promotionId?.trim();

    if (promoCode && promotionId) {
      throw new BadRequestException(
        'Utilisez un code promo ou une promotion, pas les deux en même temps.',
      );
    }

    if (promoCode) {
      const row = await this.findPromoCodeByCode(promoCode);
      this.assertDiscountable(row, 'code promo');
      const discountCents = this.computeDiscountCents(
        subtotalCents,
        row.discountType,
        row.discountValue,
      );
      return {
        kind: 'promo_code',
        id: row.id,
        label: row.code,
        discountType: row.discountType,
        discountValue: Number(row.discountValue),
        discountCents,
        promoCodeId: row.id,
        promotionId: null,
      };
    }

    if (promotionId) {
      const row = await this.promotionsRepository.findOne({
        where: { id: promotionId },
      });
      if (!row || row.deletedAt) {
        throw new NotFoundException('Promotion introuvable.');
      }
      if (!row.discountType || row.discountValue == null) {
        throw new BadRequestException('Cette promotion n’offre pas de réduction.');
      }
      this.assertDiscountable(row, 'promotion');
      const discountCents = this.computeDiscountCents(
        subtotalCents,
        row.discountType,
        row.discountValue,
      );
      return {
        kind: 'promotion',
        id: row.id,
        label: row.name,
        discountType: row.discountType,
        discountValue: Number(row.discountValue),
        discountCents,
        promoCodeId: null,
        promotionId: row.id,
      };
    }

    return null;
  }

  async recordRedemption(
    manager: EntityManager,
    discount: AppliedCheckoutDiscount | null,
  ): Promise<void> {
    if (!discount) return;

    if (discount.promoCodeId) {
      const repo = manager.getRepository(PromoCodes);
      const row = await repo.findOne({
        where: { id: discount.promoCodeId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!row || row.deletedAt) {
        throw new BadRequestException('Code promo introuvable.');
      }
      this.assertRedemptionAvailable(row);
      row.redemptionCount += 1;
      await repo.save(row);
      return;
    }

    if (discount.promotionId) {
      const repo = manager.getRepository(Promotions);
      const row = await repo.findOne({
        where: { id: discount.promotionId },
        lock: { mode: 'pessimistic_write' },
      });
      if (!row || row.deletedAt) {
        throw new BadRequestException('Promotion introuvable.');
      }
      this.assertRedemptionAvailable(row);
      row.redemptionCount += 1;
      await repo.save(row);
    }
  }

  /** Records promo/promotion redemption stored on an assisted booking at approval time. */
  async recordRedemptionFromBooking(
    manager: EntityManager,
    booking: Pick<Bookings, 'promoCodeId' | 'promotionId'>,
  ): Promise<void> {
    if (booking.promoCodeId) {
      await this.recordRedemption(manager, {
        kind: 'promo_code',
        id: booking.promoCodeId,
        label: '',
        discountType: 'fixed_amount',
        discountValue: 0,
        discountCents: 0,
        promoCodeId: booking.promoCodeId,
        promotionId: null,
      });
      return;
    }
    if (booking.promotionId) {
      await this.recordRedemption(manager, {
        kind: 'promotion',
        id: booking.promotionId,
        label: '',
        discountType: 'fixed_amount',
        discountValue: 0,
        discountCents: 0,
        promoCodeId: null,
        promotionId: booking.promotionId,
      });
    }
  }

  private async findPromoCodeByCode(code: string): Promise<PromoCodes> {
    const normalized = code.trim().toUpperCase();
    const row = await this.promoCodesRepository
      .createQueryBuilder('pc')
      .where('pc.deletedAt IS NULL')
      .andWhere('UPPER(pc.code) = :code', { code: normalized })
      .getOne();

    if (!row) {
      throw new BadRequestException(`Code promo invalide : « ${code} ».`);
    }
    return row;
  }

  private assertDiscountable(
    row: {
      active: number;
      validFrom: string | Date | null;
      validUntil: string | Date | null;
      maxRedemptions: number | null;
      redemptionCount: number;
      discountType?: string | null;
      discountValue?: string | null;
    },
    label: string,
  ): void {
    if (row.active !== 1) {
      throw new BadRequestException(`Ce ${label} n’est pas actif.`);
    }

    const today = this.todayUtc();
    const from = this.toDateString(row.validFrom);
    const until = this.toDateString(row.validUntil);
    if (from && today < from) {
      throw new BadRequestException(`Ce ${label} n’est pas encore valide.`);
    }
    if (until && today > until) {
      throw new BadRequestException(`Ce ${label} a expiré.`);
    }

    this.assertRedemptionAvailable(row);
  }

  private assertRedemptionAvailable(row: {
    maxRedemptions: number | null;
    redemptionCount: number;
  }): void {
    if (
      row.maxRedemptions != null &&
      row.redemptionCount >= row.maxRedemptions
    ) {
      throw new BadRequestException('Nombre maximum d’utilisations atteint.');
    }
  }

  computeDiscountCents(
    subtotalCents: number,
    discountType: 'percent' | 'fixed_amount',
    discountValue: string | number,
  ): number {
    const value = Number(discountValue);
    if (!Number.isFinite(value) || value <= 0) {
      throw new BadRequestException('Valeur de réduction invalide.');
    }

    let discountCents: number;
    if (discountType === 'percent') {
      if (value > 100) {
        throw new BadRequestException('Le pourcentage de réduction ne peut pas dépasser 100.');
      }
      discountCents = Math.round((subtotalCents * value) / 100);
    } else {
      discountCents = Math.round(value * 100);
    }

    return Math.min(Math.max(0, discountCents), subtotalCents);
  }

  private todayUtc(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private toDateString(value: string | Date | null | undefined): string | null {
    if (value == null) return null;
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return String(value).slice(0, 10);
  }
}
