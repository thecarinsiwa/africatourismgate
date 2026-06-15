import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Bookings, Payments, Users } from '../../../entities/generated';
import { StripeService } from '../../stripe/stripe.service';
import { PaymentAdminDetailDto } from './dto/payment-admin-detail.dto';
import { PaymentListItemDto } from './dto/payment-list-item.dto';
import { PaymentsListQueryDto } from './dto/payments-list-query.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payments)
    private readonly paymentsRepository: Repository<Payments>,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly stripeService: StripeService,
  ) {}

  async list(query: PaymentsListQueryDto): Promise<PaginatedResult<PaymentListItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.paymentsRepository
      .createQueryBuilder('payment')
      .innerJoin(
        Bookings,
        'booking',
        'booking.id = payment.bookingId AND booking.deletedAt IS NULL',
      )
      .innerJoin(
        Users,
        'client',
        'client.id = booking.userId AND client.deletedAt IS NULL',
      )
      .where('payment.deletedAt IS NULL');

    if (query.status) {
      qb.andWhere('payment.status = :status', { status: query.status });
    }
    if (query.dateFrom) {
      qb.andWhere('payment.createdAt >= :dateFrom', {
        dateFrom: `${query.dateFrom}T00:00:00.000Z`,
      });
    }
    if (query.dateTo) {
      qb.andWhere('payment.createdAt <= :dateTo', {
        dateTo: `${query.dateTo}T23:59:59.999Z`,
      });
    }
    if (query.organizationId) {
      qb.andWhere('client.organizationId = :organizationId', {
        organizationId: query.organizationId,
      });
    }

    const total = await qb.getCount();

    const rows = await qb
      .select([
        'payment.id AS id',
        'payment.bookingId AS bookingId',
        'payment.amountCents AS amountCents',
        'payment.currency AS currency',
        'payment.status AS status',
        'payment.provider AS provider',
        'payment.createdAt AS createdAt',
        'client.email AS clientEmail',
        'client.firstName AS clientFirstName',
        'client.lastName AS clientLastName',
        'client.organizationId AS organizationId',
      ])
      .orderBy('payment.createdAt', 'DESC')
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany<{
        id: string;
        bookingId: string;
        amountCents: string | number;
        currency: string;
        status: PaymentListItemDto['status'];
        provider: string | null;
        createdAt: Date;
        clientEmail: string;
        clientFirstName: string;
        clientLastName: string;
        organizationId: string | null;
      }>();

    return {
      data: rows.map((row) => ({
        id: row.id,
        bookingId: row.bookingId,
        amountCents: Number(row.amountCents),
        currency: row.currency,
        status: row.status,
        provider: row.provider,
        createdAt: row.createdAt,
        clientEmail: row.clientEmail ?? '—',
        clientFirstName: row.clientFirstName ?? '',
        clientLastName: row.clientLastName ?? '',
        organizationId: row.organizationId ?? null,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getAdminDetail(id: string): Promise<PaymentAdminDetailDto> {
    const payment = await this.paymentsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!payment) {
      throw new NotFoundException('Paiement introuvable.');
    }

    const booking = await this.bookingsRepository.findOne({
      where: { id: payment.bookingId, deletedAt: IsNull() },
    });
    if (!booking) {
      throw new NotFoundException('Réservation introuvable.');
    }

    const client = await this.usersRepository.findOne({
      where: { id: booking.userId, deletedAt: IsNull() },
    });

    return {
      id: payment.id,
      bookingId: payment.bookingId,
      amountCents: payment.amountCents,
      currency: payment.currency,
      status: payment.status,
      provider: payment.provider,
      externalId: payment.externalId,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
      bookingStatus: booking.status,
      clientEmail: client?.email ?? '—',
      clientFirstName: client?.firstName ?? '',
      clientLastName: client?.lastName ?? '',
      organizationId: client?.organizationId ?? null,
    };
  }

  refund(id: string, amountCents: number | undefined, actorUserId: string) {
    return this.stripeService.createRefundForPayment(id, amountCents, actorUserId);
  }
}
