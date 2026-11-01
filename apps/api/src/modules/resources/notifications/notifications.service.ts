import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import type {
  StaffNotificationPayload,
  StaffNotificationType,
} from '@africatourismgate/types';
import { newId } from '../../../common/utils/uuid';
import {
  BookingItems,
  Bookings,
  Users,
} from '../../../entities/generated';
import {
  Notifications,
} from '../../../entities/notification.entity';
import { PermissionsService } from '../../rbac/permissions.service';
import { StaffNotificationDto } from './dto/staff-notification.dto';

const DEFAULT_LIST_LIMIT = 50;

const BOOKING_NOTIFICATION_TYPES: StaffNotificationType[] = [
  'booking_pending_approval',
  'booking_client_message',
];

function toDto(row: Notifications): StaffNotificationDto {
  const createdAt =
    row.createdAt instanceof Date
      ? row.createdAt.toISOString()
      : new Date(row.createdAt as unknown as string).toISOString();
  const readAt =
    row.readAt == null
      ? null
      : row.readAt instanceof Date
        ? row.readAt.toISOString()
        : new Date(row.readAt as unknown as string).toISOString();
  return {
    id: row.id,
    userId: row.userId,
    type: row.type,
    payload: row.payload ?? { href: '/notifications', priority: 'normal' },
    readAt,
    createdAt,
  };
}

function formatBookingListName(items: BookingItems[]): string {
  if (items.length === 0) return '';
  const primary = items[0]?.titleSnapshot?.trim() || items[0]?.itemType || '';
  if (items.length === 1) return primary;
  return `${primary} (+${items.length - 1})`;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notifications)
    private readonly repository: Repository<Notifications>,
    @InjectRepository(BookingItems)
    private readonly bookingItemsRepository: Repository<BookingItems>,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly permissionsService: PermissionsService,
  ) {}

  /**
   * Insert one notification row per recipient with any of the given permissions
   * (or super_admin). Failures are logged and do not throw.
   */
  async fanOut(
    type: StaffNotificationType,
    payload: StaffNotificationPayload,
    permissionCodes: string[],
  ): Promise<void> {
    try {
      const userIds =
        await this.permissionsService.listUserIdsWithAnyPermission(
          permissionCodes,
        );
      if (userIds.length === 0) {
        return;
      }
      const rows = userIds.map((userId) =>
        this.repository.create({
          id: newId(),
          userId,
          type,
          payload,
          readAt: null,
        }),
      );
      await this.repository.save(rows);
    } catch (err) {
      this.logger.warn(
        `fanOut(${type}) failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async listForUser(
    userId: string,
    options?: { unreadOnly?: boolean; limit?: number },
  ): Promise<StaffNotificationDto[]> {
    const limit = Math.min(
      Math.max(options?.limit ?? DEFAULT_LIST_LIMIT, 1),
      100,
    );
    const qb = this.repository
      .createQueryBuilder('n')
      .where('n.user_id = :userId', { userId })
      .orderBy('n.created_at', 'DESC')
      .take(limit);
    if (options?.unreadOnly) {
      qb.andWhere('n.read_at IS NULL');
    }
    const rows = await qb.getMany();
    return this.enrichBookingPayloads(rows.map(toDto));
  }

  /** Backfill bookingTitle / authorName for older notification payloads. */
  private async enrichBookingPayloads(
    dtos: StaffNotificationDto[],
  ): Promise<StaffNotificationDto[]> {
    const bookingIds = [
      ...new Set(
        dtos
          .filter(
            (dto) =>
              BOOKING_NOTIFICATION_TYPES.includes(dto.type) &&
              dto.payload.bookingId &&
              (!dto.payload.bookingTitle || !dto.payload.authorName),
          )
          .map((dto) => dto.payload.bookingId as string),
      ),
    ];
    if (bookingIds.length === 0) {
      return dtos;
    }

    const [items, bookings] = await Promise.all([
      this.bookingItemsRepository.find({
        where: { bookingId: In(bookingIds) },
        order: { createdAt: 'ASC' },
      }),
      this.bookingsRepository.find({
        where: { id: In(bookingIds) },
      }),
    ]);

    const itemsByBooking = new Map<string, BookingItems[]>();
    for (const item of items) {
      if (item.deletedAt) continue;
      const list = itemsByBooking.get(item.bookingId) ?? [];
      list.push(item);
      itemsByBooking.set(item.bookingId, list);
    }

    const userIds = [
      ...new Set(
        bookings
          .map((b) => b.userId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];
    const users =
      userIds.length > 0
        ? await this.usersRepository.find({ where: { id: In(userIds) } })
        : [];
    const userById = new Map(users.map((u) => [u.id, u]));
    const bookingById = new Map(bookings.map((b) => [b.id, b]));

    return dtos.map((dto) => {
      const bookingId = dto.payload.bookingId;
      if (
        !bookingId ||
        !BOOKING_NOTIFICATION_TYPES.includes(dto.type) ||
        (dto.payload.bookingTitle && dto.payload.authorName)
      ) {
        return dto;
      }

      const title =
        dto.payload.bookingTitle ||
        formatBookingListName(itemsByBooking.get(bookingId) ?? []) ||
        undefined;
      let authorName = dto.payload.authorName;
      if (!authorName) {
        const booking = bookingById.get(bookingId);
        const owner = booking?.userId
          ? userById.get(booking.userId)
          : undefined;
        authorName =
          `${owner?.firstName ?? ''} ${owner?.lastName ?? ''}`.trim() ||
          owner?.email ||
          undefined;
      }

      return {
        ...dto,
        payload: {
          ...dto.payload,
          bookingTitle: title,
          authorName,
        },
      };
    });
  }

  async unreadCount(userId: string): Promise<{ count: number }> {
    const count = await this.repository.count({
      where: { userId, readAt: IsNull() },
    });
    return { count };
  }

  async markRead(userId: string, id: string): Promise<StaffNotificationDto> {
    const row = await this.repository.findOne({ where: { id, userId } });
    if (!row) {
      throw new NotFoundException('Notification introuvable.');
    }
    if (!row.readAt) {
      row.readAt = new Date();
      await this.repository.save(row);
    }
    return toDto(row);
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const result = await this.repository
      .createQueryBuilder()
      .update(Notifications)
      .set({ readAt: new Date() })
      .where('user_id = :userId', { userId })
      .andWhere('read_at IS NULL')
      .execute();
    return { updated: result.affected ?? 0 };
  }
}
