import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Bookings, Payments, Users } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { PermissionsService } from '../../rbac/permissions.service';
import { PaymentAdminDetailDto } from './dto/payment-admin-detail.dto';
import { PaymentListItemDto } from './dto/payment-list-item.dto';
import { PaymentsListQueryDto } from './dto/payments-list-query.dto';

@Injectable()
export class PaymentsService extends CrudService<Payments> {
  constructor(
    @InjectRepository(Payments)
    private readonly paymentsRepository: Repository<Payments>,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly permissionsService: PermissionsService,
  ) {
    super(paymentsRepository);
  }

  async list(
    query: PaymentsListQueryDto,
    currentUserId: string,
  ): Promise<PaginatedResult<PaymentListItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const staff = await this.permissionsService.hasAnyPermission(currentUserId, [
      'users.read',
    ]);

    const scopedQuery = { ...query };
    if (!staff) {
      scopedQuery.organizationId = undefined;
    }

    const qb = this.paymentsRepository
      .createQueryBuilder('payment')
      .where('payment.deletedAt IS NULL');

    if (scopedQuery.status) {
      qb.andWhere('payment.status = :status', { status: scopedQuery.status });
    }
    if (scopedQuery.dateFrom) {
      qb.andWhere('payment.createdAt >= :dateFrom', {
        dateFrom: `${scopedQuery.dateFrom}T00:00:00.000Z`,
      });
    }
    if (scopedQuery.dateTo) {
      qb.andWhere('payment.createdAt <= :dateTo', {
        dateTo: `${scopedQuery.dateTo}T23:59:59.999Z`,
      });
    }
    if (scopedQuery.organizationId) {
      qb.innerJoin(
        Bookings,
        'booking',
        'booking.id = payment.bookingId AND booking.deletedAt IS NULL',
      );
      qb.innerJoin(
        Users,
        'client',
        'client.id = booking.userId AND client.deletedAt IS NULL',
      );
      qb.andWhere('client.organizationId = :organizationId', {
        organizationId: scopedQuery.organizationId,
      });
    }

    qb.orderBy('payment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [payments, total] = await qb.getManyAndCount();
    const bookingIds = [...new Set(payments.map((p) => p.bookingId))];
    const bookings =
      bookingIds.length > 0
        ? await this.bookingsRepository.find({
            where: { id: In(bookingIds), deletedAt: IsNull() },
          })
        : [];
    const bookingById = new Map(bookings.map((b) => [b.id, b]));
    const userIds = [...new Set(bookings.map((b) => b.userId))];
    const users =
      userIds.length > 0
        ? await this.usersRepository.find({
            where: { id: In(userIds), deletedAt: IsNull() },
          })
        : [];
    const userById = new Map(users.map((u) => [u.id, u]));

    const data = payments.map((payment) => {
      const booking = bookingById.get(payment.bookingId);
      const client = booking ? userById.get(booking.userId) : undefined;
      return {
        id: payment.id,
        bookingId: payment.bookingId,
        amountCents: payment.amountCents,
        currency: payment.currency,
        status: payment.status,
        provider: payment.provider,
        createdAt: payment.createdAt,
        clientEmail: client?.email ?? '—',
        clientFirstName: client?.firstName ?? '',
        clientLastName: client?.lastName ?? '',
        organizationId: client?.organizationId ?? null,
      } satisfies PaymentListItemDto;
    });

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
}
