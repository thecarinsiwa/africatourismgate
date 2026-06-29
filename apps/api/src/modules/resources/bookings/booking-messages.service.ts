import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { newId } from '../../../common/utils/uuid';
import { BookingMessages, Bookings } from '../../../entities/generated';
import { PermissionsService } from '../../rbac/permissions.service';
import { BookingAssistedEmailService } from './booking-assisted-email.service';
import { BookingNotificationsService } from './booking-notifications.service';
import { BookingMessageDto, BookingMessagesListDto } from './dto/booking-message.dto';
import { CreateBookingMessageDto } from './dto/create-booking-message.dto';

@Injectable()
export class BookingMessagesService {
  constructor(
    @InjectRepository(BookingMessages)
    private readonly messagesRepository: Repository<BookingMessages>,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    private readonly permissionsService: PermissionsService,
    private readonly notifications: BookingNotificationsService,
    private readonly assistedEmail: BookingAssistedEmailService,
  ) {}

  async listByBookingId(
    bookingId: string,
    actorUserId: string,
    chatToken?: string,
  ): Promise<BookingMessagesListDto> {
    const booking = await this.assertCanAccessThread(bookingId, actorUserId, chatToken);

    const rows = await this.messagesRepository.find({
      where: { bookingId, deletedAt: IsNull() },
      order: { createdAt: 'ASC', id: 'ASC' },
    });

    const isStaff = await this.isStaffUser(actorUserId);
    if (!isStaff && booking.userId === actorUserId) {
      await this.notifications.markThreadSeenByCustomer(bookingId, actorUserId);
    }

    return {
      messages: rows.map((row) => this.toDto(row)),
    };
  }

  async createMessage(
    bookingId: string,
    dto: CreateBookingMessageDto,
    actorUserId: string,
    chatToken?: string,
  ): Promise<BookingMessageDto> {
    const booking = await this.assertCanAccessThread(bookingId, actorUserId, chatToken);

    const body = dto.body.trim();
    if (!body) {
      throw new BadRequestException('Le message ne peut pas être vide.');
    }

    const isStaff = await this.isStaffUser(actorUserId);
    const messageId = newId();
    const createdAt = await this.nextMessageCreatedAt(bookingId);

    await this.messagesRepository.save(
      this.messagesRepository.create({
        id: messageId,
        bookingId,
        userId: actorUserId,
        body,
        isStaff: isStaff ? 1 : 0,
        createdAt,
        createdByUserId: actorUserId,
      } as BookingMessages),
    );

    const message = await this.messagesRepository.findOneOrFail({
      where: { id: messageId },
    });

    if (isStaff && !this.notifications.isCustomerOnlineOnThread(booking)) {
      this.assistedEmail.notifyStaffMessage(bookingId, body);
    }

    return this.toDto(message);
  }

  async touchThreadPresence(bookingId: string, actorUserId: string): Promise<void> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId, deletedAt: IsNull() },
    });
    if (!booking) {
      throw new NotFoundException('Réservation introuvable.');
    }

    const staff = await this.isStaffUser(actorUserId);
    if (staff || booking.userId !== actorUserId) {
      throw new ForbiddenException('Access denied.');
    }

    await this.notifications.touchThreadPresence(bookingId, actorUserId);
  }

  private async assertCanAccessThread(
    bookingId: string,
    actorUserId: string,
    chatToken?: string,
  ): Promise<Bookings> {
    if (chatToken?.trim()) {
      const tokenUserId = await this.resolveChatTokenUserId(bookingId, chatToken);
      if (tokenUserId && tokenUserId !== actorUserId) {
        throw new ForbiddenException('Access denied.');
      }
    }

    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId, deletedAt: IsNull() },
    });
    if (!booking) {
      throw new NotFoundException('Réservation introuvable.');
    }

    const staff = await this.isStaffUser(actorUserId);
    if (!staff && booking.userId !== actorUserId) {
      throw new ForbiddenException('Access denied.');
    }

    return booking;
  }

  /**
   * CE-6: validate signed email chat token and return booking owner user id.
   * Returns null until token issuance is implemented.
   */
  private async resolveChatTokenUserId(
    _bookingId: string,
    _chatToken: string,
  ): Promise<string | null> {
    return null;
  }

  private async isStaffUser(userId: string): Promise<boolean> {
    if (await this.permissionsService.hasSuperAdminRole(userId)) {
      return true;
    }
    return this.permissionsService.hasAnyPermission(userId, ['users.read']);
  }

  /**
   * MySQL TIMESTAMP is second-precision; rapid replies can collide and shuffle thread order.
   * Ensure each message sorts after the previous one in the same booking.
   */
  private async nextMessageCreatedAt(bookingId: string): Promise<Date> {
    const latest = await this.messagesRepository.findOne({
      where: { bookingId, deletedAt: IsNull() },
      order: { createdAt: 'DESC', id: 'DESC' },
      select: ['createdAt'],
    });

    const now = new Date();
    if (!latest?.createdAt) {
      return now;
    }

    const nowSec = Math.floor(now.getTime() / 1000);
    const lastSec = Math.floor(latest.createdAt.getTime() / 1000);
    if (nowSec > lastSec) {
      return now;
    }

    return new Date((lastSec + 1) * 1000);
  }

  private toDto(message: BookingMessages): BookingMessageDto {
    return {
      id: message.id,
      bookingId: message.bookingId,
      userId: message.userId,
      body: message.body,
      isStaff: message.isStaff === 1,
      createdAt: message.createdAt.toISOString(),
    };
  }
}
