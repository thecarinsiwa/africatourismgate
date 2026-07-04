import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import {
  BookingMessages,
  Bookings,
  BookingStatusHistory,
  Payments,
} from '../../../entities/generated';

/** Customer is considered online on the chat thread when presence was updated recently. */
export const BOOKING_THREAD_PRESENCE_TTL_MS = 90_000;

export const BOOKING_PAYMENT_REMINDER_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class BookingNotificationsService {
  constructor(
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    @InjectRepository(BookingMessages)
    private readonly messagesRepository: Repository<BookingMessages>,
    @InjectRepository(Payments)
    private readonly paymentsRepository: Repository<Payments>,
    @InjectRepository(BookingStatusHistory)
    private readonly statusHistoryRepository: Repository<BookingStatusHistory>,
  ) {}

  isCustomerOnlineOnThread(booking: Pick<Bookings, 'customerThreadPresenceAt'>): boolean {
    const presence = booking.customerThreadPresenceAt;
    if (!presence) {
      return false;
    }
    return Date.now() - presence.getTime() < BOOKING_THREAD_PRESENCE_TTL_MS;
  }

  async touchThreadPresence(bookingId: string, customerUserId: string): Promise<void> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId, userId: customerUserId, deletedAt: IsNull() },
    });
    if (!booking) {
      return;
    }
    const now = new Date();
    await this.bookingsRepository.update(bookingId, {
      customerThreadPresenceAt: now,
      customerThreadLastSeenAt: now,
    });
  }

  async markThreadSeenByStaff(bookingId: string): Promise<void> {
    const now = new Date();

    const latestCustomerMessage = await this.messagesRepository.findOne({
      where: { bookingId, deletedAt: IsNull(), isStaff: 0 },
      order: { createdAt: 'DESC', id: 'DESC' },
      select: ['createdAt'],
    });

    const seenAt =
      latestCustomerMessage?.createdAt && latestCustomerMessage.createdAt > now
        ? latestCustomerMessage.createdAt
        : now;

    await this.bookingsRepository.update(bookingId, {
      staffThreadLastSeenAt: seenAt,
    });
  }

  async countUnreadCustomerMessages(bookingId: string): Promise<number> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId, deletedAt: IsNull() },
      select: ['id', 'staffThreadLastSeenAt'],
    });
    if (!booking) {
      return 0;
    }

    const qb = this.messagesRepository
      .createQueryBuilder('message')
      .where('message.booking_id = :bookingId', { bookingId })
      .andWhere('message.deleted_at IS NULL')
      .andWhere('message.is_staff = 0');

    if (booking.staffThreadLastSeenAt) {
      qb.andWhere('message.created_at > :lastSeen', {
        lastSeen: booking.staffThreadLastSeenAt,
      });
    }

    return qb.getCount();
  }

  async countUnreadStaffMessages(bookingId: string): Promise<number> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId, deletedAt: IsNull() },
      select: ['id', 'customerThreadLastSeenAt'],
    });
    if (!booking) {
      return 0;
    }

    const qb = this.messagesRepository
      .createQueryBuilder('message')
      .where('message.booking_id = :bookingId', { bookingId })
      .andWhere('message.deleted_at IS NULL')
      .andWhere('message.is_staff = 1');

    if (booking.customerThreadLastSeenAt) {
      qb.andWhere('message.created_at > :lastSeen', {
        lastSeen: booking.customerThreadLastSeenAt,
      });
    }

    return qb.getCount();
  }

  async getUnreadCustomerMessageBookingIds(bookingIds: string[]): Promise<Set<string>> {
    if (bookingIds.length === 0) {
      return new Set();
    }

    const rows = await this.messagesRepository
      .createQueryBuilder('message')
      .innerJoin(Bookings, 'booking', 'booking.id = message.booking_id')
      .where('message.booking_id IN (:...bookingIds)', { bookingIds })
      .andWhere('message.deleted_at IS NULL')
      .andWhere('message.is_staff = 0')
      .andWhere(
        '(booking.staff_thread_last_seen_at IS NULL OR message.created_at > booking.staff_thread_last_seen_at)',
      )
      .select('DISTINCT message.booking_id', 'bookingId')
      .getRawMany<{ bookingId: string }>();

    return new Set(rows.map((row) => row.bookingId));
  }

  async markThreadSeenByCustomer(bookingId: string, customerUserId: string): Promise<void> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId, userId: customerUserId, deletedAt: IsNull() },
    });
    if (!booking) {
      return;
    }

    const latestStaffMessage = await this.messagesRepository.findOne({
      where: { bookingId, deletedAt: IsNull(), isStaff: 1 },
      order: { createdAt: 'DESC', id: 'DESC' },
      select: ['createdAt'],
    });

    const now = new Date();
    const seenAt =
      latestStaffMessage?.createdAt && latestStaffMessage.createdAt > now
        ? latestStaffMessage.createdAt
        : now;

    await this.bookingsRepository.update(bookingId, {
      customerThreadLastSeenAt: seenAt,
      customerThreadPresenceAt: now,
    });
  }

  async hasUnreadStaffMessages(
    bookingId: string,
    lastSeenAt: Date | null,
  ): Promise<boolean> {
    const qb = this.messagesRepository
      .createQueryBuilder('message')
      .where('message.booking_id = :bookingId', { bookingId })
      .andWhere('message.deleted_at IS NULL')
      .andWhere('message.is_staff = 1');

    if (lastSeenAt) {
      qb.andWhere('message.created_at > :lastSeenAt', { lastSeenAt });
    }

    const count = await qb.getCount();
    return count > 0;
  }

  async getPaymentInvitedBookingIds(bookingIds: string[]): Promise<Set<string>> {
    if (bookingIds.length === 0) {
      return new Set();
    }
    const rows = await this.paymentsRepository.find({
      where: {
        bookingId: In(bookingIds),
        deletedAt: IsNull(),
        status: 'pending',
        provider: 'stripe',
      },
      select: ['bookingId'],
    });
    return new Set(rows.map((row) => row.bookingId));
  }

  async getUnreadStaffMessageBookingIds(bookingIds: string[]): Promise<Set<string>> {
    if (bookingIds.length === 0) {
      return new Set();
    }

    const rows = await this.messagesRepository
      .createQueryBuilder('message')
      .innerJoin(Bookings, 'booking', 'booking.id = message.booking_id')
      .where('message.booking_id IN (:...bookingIds)', { bookingIds })
      .andWhere('message.deleted_at IS NULL')
      .andWhere('message.is_staff = 1')
      .andWhere(
        '(booking.customer_thread_last_seen_at IS NULL OR message.created_at > booking.customer_thread_last_seen_at)',
      )
      .select('DISTINCT message.booking_id', 'bookingId')
      .getRawMany<{ bookingId: string }>();

    return new Set(rows.map((row) => row.bookingId));
  }

  computeActionRequired(
    booking: Bookings,
    paymentInvitedIds: Set<string>,
    unreadStaffIds: Set<string>,
  ): boolean {
    if (booking.status === 'pending_payment' && paymentInvitedIds.has(booking.id)) {
      return true;
    }
    return unreadStaffIds.has(booking.id);
  }

  async listPaymentReminderCandidates(): Promise<Bookings[]> {
    const cutoff = new Date(Date.now() - BOOKING_PAYMENT_REMINDER_AFTER_MS);

    const rows = await this.bookingsRepository
      .createQueryBuilder('booking')
      .innerJoin(
        Payments,
        'payment',
        'payment.booking_id = booking.id AND payment.deleted_at IS NULL AND payment.status = :paymentStatus AND payment.provider = :provider',
        { paymentStatus: 'pending', provider: 'stripe' },
      )
      .innerJoin(
        BookingStatusHistory,
        'history',
        'history.booking_id = booking.id AND history.to_status = :pendingPayment',
        { pendingPayment: 'pending_payment' },
      )
      .where('booking.deleted_at IS NULL')
      .andWhere('booking.status = :pendingPayment')
      .andWhere('booking.payment_reminder_sent_at IS NULL')
      .groupBy('booking.id')
      .having('MAX(history.created_at) <= :cutoff', { cutoff })
      .getMany();

    return rows;
  }

  async markPaymentReminderSent(bookingId: string): Promise<void> {
    await this.bookingsRepository.update(bookingId, {
      paymentReminderSentAt: new Date(),
    });
  }
}
