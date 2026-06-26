import {
  BadRequestException,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { Bookings, Organizations, Payments, Users } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';
import { BookingEngineService } from './booking-engine.service';
import { BookingAssistedEmailService } from './booking-assisted-email.service';
import { BookingStatusHistoryService } from './booking-status-history.service';
import { BookingAdminDetailDto } from './dto/booking-admin-detail.dto';
import { BookingListItemDto } from './dto/booking-list-item.dto';
import { BookingsListQueryDto } from './dto/bookings-list-query.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { BookingCheckoutDto } from './dto/booking-checkout.dto';
import { BookingCheckoutPreviewResponseDto } from './dto/booking-checkout-preview-response.dto';
import { BookingDetailDto } from './dto/booking-detail.dto';
import { BookingRequestResponseDto } from './dto/booking-request-response.dto';
import { PermissionsService } from '../../rbac/permissions.service';
import { ReviewsService } from '../reviews/reviews.service';
import { CreateBookingReviewDto } from '../reviews/dto/create-booking-review.dto';
import { ReviewDto } from '../reviews/dto/review.dto';

@Injectable()
export class BookingsService extends CrudService<Bookings> {
  constructor(
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Organizations)
    private readonly organizationsRepository: Repository<Organizations>,
    @InjectRepository(Payments)
    private readonly paymentsRepository: Repository<Payments>,
    private readonly bookingEngine: BookingEngineService,
    private readonly statusHistory: BookingStatusHistoryService,
    private readonly permissionsService: PermissionsService,
    private readonly reviewsService: ReviewsService,
    private readonly assistedEmail: BookingAssistedEmailService,
  ) {
    super(bookingsRepository);
  }

  async previewCheckout(
    dto: BookingCheckoutDto,
    actorUserId: string,
  ): Promise<BookingCheckoutPreviewResponseDto> {
    await this.assertStaffOnlyCustomerUserId(dto, actorUserId);
    return this.bookingEngine.previewCheckout(dto, actorUserId);
  }

  async createFromCheckout(
    dto: BookingCheckoutDto,
    actorUserId: string,
  ): Promise<BookingDetailDto> {
    await this.assertStaffOnlyCustomerUserId(dto, actorUserId);
    const ownerUserId = await this.resolveCheckoutOwnerUserId(dto, actorUserId);
    return this.bookingEngine.createBooking(dto, ownerUserId, actorUserId);
  }

  async requestFromCheckout(
    dto: BookingCheckoutDto,
    actorUserId: string,
  ): Promise<BookingRequestResponseDto> {
    await this.assertStaffOnlyCustomerUserId(dto, actorUserId);
    const ownerUserId = await this.resolveCheckoutOwnerUserId(dto, actorUserId);
    const result = await this.bookingEngine.createBookingRequest(dto, ownerUserId, actorUserId);
    this.assistedEmail.notifyRequestReceived(result.bookingId);
    return result;
  }

  private async isStaffUser(userId: string): Promise<boolean> {
    return this.permissionsService.hasAnyPermission(userId, ['users.read']);
  }

  private async assertStaffOnlyCustomerUserId(
    dto: BookingCheckoutDto,
    actorUserId: string,
  ): Promise<void> {
    if (!dto.customerUserId) {
      return;
    }
    const staff = await this.isStaffUser(actorUserId);
    if (!staff) {
      throw new ForbiddenException(
        'Le champ customerUserId est réservé au personnel autorisé.',
      );
    }
  }

  private async resolveCheckoutOwnerUserId(
    dto: BookingCheckoutDto,
    actorUserId: string,
  ): Promise<string> {
    const customerUserId = dto.customerUserId?.trim();
    if (!customerUserId) {
      return actorUserId;
    }

    const customer = await this.usersRepository.findOne({
      where: { id: customerUserId, deletedAt: IsNull() },
    });
    if (!customer) {
      throw new NotFoundException('Client introuvable.');
    }
    if (customer.status !== 'active') {
      throw new BadRequestException('Le compte client n’est pas actif.');
    }

    return customer.id;
  }

  async list(
    query: BookingsListQueryDto,
    currentUserId: string,
  ): Promise<PaginatedResult<BookingListItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const staff = await this.permissionsService.hasAnyPermission(currentUserId, [
      'users.read',
    ]);

    const scopedQuery = { ...query };
    if (!staff) {
      scopedQuery.userId = currentUserId;
      scopedQuery.organizationId = undefined;
    }

    const qb = this.bookingsRepository
      .createQueryBuilder('booking')
      .where('booking.deletedAt IS NULL');

    if (scopedQuery.status) {
      qb.andWhere('booking.status = :status', { status: scopedQuery.status });
    }
    if (scopedQuery.userId) {
      qb.andWhere('booking.userId = :userId', { userId: scopedQuery.userId });
    }
    if (scopedQuery.dateFrom) {
      qb.andWhere('booking.createdAt >= :dateFrom', {
        dateFrom: `${scopedQuery.dateFrom}T00:00:00.000Z`,
      });
    }
    if (scopedQuery.dateTo) {
      qb.andWhere('booking.createdAt <= :dateTo', {
        dateTo: `${scopedQuery.dateTo}T23:59:59.999Z`,
      });
    }
    if (scopedQuery.organizationId) {
      qb.innerJoin(
        Users,
        'client',
        'client.id = booking.userId AND client.deletedAt IS NULL',
      );
      qb.andWhere('client.organizationId = :organizationId', {
        organizationId: scopedQuery.organizationId,
      });
    }

    qb.orderBy('booking.createdAt', scopedQuery.sortOrder === 'asc' ? 'ASC' : 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [bookings, total] = await qb.getManyAndCount();
    const userIds = [...new Set(bookings.map((b) => b.userId))];
    const users =
      userIds.length > 0
        ? await this.usersRepository.find({
            where: { id: In(userIds) },
          })
        : [];
    const userById = new Map(users.map((u) => [u.id, u]));

    const data = bookings.map((booking) => {
      const client = userById.get(booking.userId);
      return {
        id: booking.id,
        userId: booking.userId,
        status: booking.status,
        totalCents: booking.totalCents,
        currency: booking.currency,
        promoCodeId: booking.promoCodeId,
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        clientEmail: client?.email ?? '—',
        clientFirstName: client?.firstName ?? '',
        clientLastName: client?.lastName ?? '',
        organizationId: client?.organizationId ?? null,
      } satisfies BookingListItemDto;
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

  async getCustomerDetail(
    id: string,
    currentUserId: string,
  ): Promise<BookingDetailDto> {
    const detail = await this.bookingEngine.getBookingDetail(id);
    if (detail.booking.userId !== currentUserId) {
      throw new ForbiddenException('Access denied.');
    }
    const review = await this.reviewsService.findByBooking(id);
    const canReview = review
      ? false
      : await this.reviewsService.canReview(id, currentUserId);
    return { ...detail, review, canReview };
  }

  async getBookingReview(
    bookingId: string,
    currentUserId: string,
  ): Promise<ReviewDto | null> {
    await this.assertBookingOwnerOrStaff(bookingId, currentUserId);
    return this.reviewsService.findByBooking(bookingId);
  }

  async createBookingReview(
    bookingId: string,
    currentUserId: string,
    dto: CreateBookingReviewDto,
  ): Promise<ReviewDto> {
    const booking = await this.assertBookingOwnerOrStaff(bookingId, currentUserId);
    const staff = await this.permissionsService.hasAnyPermission(currentUserId, [
      'users.read',
    ]);
    if (staff && booking.userId !== currentUserId) {
      throw new ForbiddenException('Seul le client peut laisser un avis.');
    }
    return this.reviewsService.createForBooking(
      bookingId,
      booking.userId,
      dto,
      currentUserId,
    );
  }

  async assertBookingOwnerOrStaff(
    bookingId: string,
    currentUserId: string,
  ): Promise<Bookings> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId, deletedAt: IsNull() },
    });
    if (!booking) {
      throw new NotFoundException('Réservation introuvable.');
    }
    const staff = await this.permissionsService.hasAnyPermission(currentUserId, [
      'users.read',
    ]);
    if (!staff && booking.userId !== currentUserId) {
      throw new ForbiddenException('Access denied.');
    }
    return booking;
  }

  async getAdminDetail(id: string): Promise<BookingAdminDetailDto> {
    const base = await this.bookingEngine.getBookingDetail(id);
    const clientUser = await this.usersRepository.findOne({
      where: { id: base.booking.userId },
    });
    if (!clientUser) {
      throw new NotFoundException('Client introuvable.');
    }

    let organizationName: string | null = null;
    if (clientUser.organizationId) {
      const org = await this.organizationsRepository.findOne({
        where: { id: clientUser.organizationId },
      });
      organizationName = org?.name ?? null;
    }

    const payments = await this.paymentsRepository.find({
      where: { bookingId: id, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    let statusHistory = await this.statusHistory.listByBookingId(id);
    if (statusHistory.length === 0) {
      statusHistory = [
        {
          id: 'legacy',
          bookingId: id,
          fromStatus: null,
          toStatus: base.booking.status,
          reason: 'Statut actuel (historique non enregistré)',
          changedByUserId: null,
          createdAt: base.booking.createdAt,
        },
      ];
    }

    return {
      booking: base.booking,
      items: base.items,
      totalCents: base.totalCents,
      currency: base.currency,
      client: {
        id: clientUser.id,
        email: clientUser.email,
        firstName: clientUser.firstName,
        lastName: clientUser.lastName,
        organizationId: clientUser.organizationId ?? null,
        organizationName,
      },
      payments,
      statusHistory,
    };
  }

  updateStatus(
    id: string,
    dto: UpdateBookingStatusDto,
    actorUserId?: string,
  ): Promise<BookingDetailDto> {
    if (actorUserId) {
      return this.assertBookingOwnerOrStaff(id, actorUserId).then(() =>
        this.bookingEngine.updateBookingStatus(
          id,
          dto.status,
          actorUserId,
          dto.reason,
        ),
      );
    }
    return this.bookingEngine.updateBookingStatus(
      id,
      dto.status,
      actorUserId,
      dto.reason,
    );
  }

  cancelWithReason(
    id: string,
    reason: string | undefined,
    actorUserId?: string,
  ): Promise<BookingDetailDto> {
    if (actorUserId) {
      return this.assertBookingOwnerOrStaff(id, actorUserId).then(() =>
        this.bookingEngine.cancelBooking(id, actorUserId, reason),
      );
    }
    return this.bookingEngine.cancelBooking(id, actorUserId, reason);
  }
}
