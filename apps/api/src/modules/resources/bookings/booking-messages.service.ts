import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import { newId } from '../../../common/utils/uuid';
import { BookingMessages, Bookings, Users } from '../../../entities/generated';
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
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly permissionsService: PermissionsService,
    private readonly notifications: BookingNotificationsService,
    private readonly assistedEmail: BookingAssistedEmailService,
  ) {}

  async listByBookingId(
    bookingId: string,
    actorUserId: string,
    options?: { chatToken?: string; markRead?: boolean },
  ): Promise<BookingMessagesListDto> {
    const booking = await this.assertCanAccessThread(
      bookingId,
      actorUserId,
      options?.chatToken,
    );

    const rows = await this.messagesRepository.find({
      where: { bookingId, deletedAt: IsNull() },
      order: { createdAt: 'ASC', id: 'ASC' },
    });

    const isStaff = await this.isStaffUser(actorUserId);
    const shouldMarkRead = options?.markRead !== false;
    if (shouldMarkRead) {
      if (isStaff) {
        await this.notifications.markThreadSeenByStaff(bookingId);
      } else if (booking.userId === actorUserId) {
        await this.notifications.markThreadSeenByCustomer(bookingId, actorUserId);
      }
    }

    return {
      messages: await this.toDtos(rows),
    };
  }

  async getUnreadCount(bookingId: string, actorUserId: string): Promise<number> {
    const booking = await this.assertCanAccessThread(bookingId, actorUserId);
    const isStaff = await this.isStaffUser(actorUserId);
    if (isStaff) {
      return this.notifications.countUnreadCustomerMessages(bookingId);
    }
    if (booking.userId === actorUserId) {
      return this.notifications.countUnreadStaffMessages(bookingId);
    }
    throw new ForbiddenException('Access denied.');
  }

  /** @deprecated Use getUnreadCount */
  async getUnreadCountForStaff(bookingId: string, actorUserId: string): Promise<number> {
    return this.getUnreadCount(bookingId, actorUserId);
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

    const customerNotifiedByEmail =
      isStaff && !this.notifications.isCustomerOnlineOnThread(booking);
    if (customerNotifiedByEmail) {
      this.assistedEmail.notifyStaffMessage(bookingId, body);
    }

    return {
      ...(await this.toDto(message)),
      customerNotifiedByEmail,
    };
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

  private async toDtos(messages: BookingMessages[]): Promise<BookingMessageDto[]> {
    const authorNames = await this.loadCustomerAuthorNames(messages);
    return Promise.all(
      messages.map((message) => this.toDto(message, authorNames.get(message.userId ?? '') ?? null)),
    );
  }

  private async toDto(
    message: BookingMessages,
    authorName?: string | null,
  ): Promise<BookingMessageDto> {
    const resolvedAuthorName =
      authorName === undefined
        ? (await this.loadCustomerAuthorNames([message])).get(message.userId ?? '') ?? null
        : authorName;

    return {
      id: message.id,
      bookingId: message.bookingId,
      userId: message.userId,
      body: message.body,
      isStaff: message.isStaff === 1,
      authorName: message.isStaff === 1 ? null : resolvedAuthorName,
      createdAt: message.createdAt.toISOString(),
    };
  }

  private async loadCustomerAuthorNames(
    messages: BookingMessages[],
  ): Promise<Map<string, string>> {
    const userIds = [
      ...new Set(
        messages
          .filter((message) => message.isStaff !== 1 && message.userId)
          .map((message) => message.userId as string),
      ),
    ];

    if (userIds.length === 0) {
      return new Map();
    }

    const users = await this.usersRepository.find({
      where: { id: In(userIds), deletedAt: IsNull() },
      select: ['id', 'firstName', 'lastName'],
    });

    const entries: [string, string][] = [];
    for (const user of users) {
      const name = this.formatUserDisplayName(user);
      if (name) {
        entries.push([user.id, name]);
      }
    }
    return new Map(entries);
  }

  private formatUserDisplayName(user: Pick<Users, 'firstName' | 'lastName'>): string {
    return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  }
}
