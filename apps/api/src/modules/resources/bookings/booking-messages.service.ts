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
  ) {}

  async listByBookingId(
    bookingId: string,
    actorUserId: string,
    chatToken?: string,
  ): Promise<BookingMessagesListDto> {
    await this.assertCanAccessThread(bookingId, actorUserId, chatToken);

    const rows = await this.messagesRepository.find({
      where: { bookingId, deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });

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
    await this.assertCanAccessThread(bookingId, actorUserId, chatToken);

    const body = dto.body.trim();
    if (!body) {
      throw new BadRequestException('Le message ne peut pas être vide.');
    }

    const isStaff = await this.isStaffUser(actorUserId);
    const messageId = newId();

    await this.messagesRepository.save(
      this.messagesRepository.create({
        id: messageId,
        bookingId,
        userId: actorUserId,
        body,
        isStaff: isStaff ? 1 : 0,
        createdByUserId: actorUserId,
      } as BookingMessages),
    );

    const message = await this.messagesRepository.findOneOrFail({
      where: { id: messageId },
    });

    return this.toDto(message);
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
