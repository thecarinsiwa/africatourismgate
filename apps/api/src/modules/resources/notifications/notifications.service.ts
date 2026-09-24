import {
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import type {
  StaffNotificationPayload,
  StaffNotificationType,
} from '@africatourismgate/types';
import { newId } from '../../../common/utils/uuid';
import {
  Notifications,
} from '../../../entities/notification.entity';
import { PermissionsService } from '../../rbac/permissions.service';
import { StaffNotificationDto } from './dto/staff-notification.dto';

const DEFAULT_LIST_LIMIT = 50;

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

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notifications)
    private readonly repository: Repository<Notifications>,
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
    return rows.map(toDto);
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
