import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { SupportTickets, Users } from '../../../entities/generated';
import { NotificationsService } from '../notifications/notifications.service';
import { SupportTicketsListQueryDto } from './dto/support-tickets-list-query.dto';

@Injectable()
export class SupportTicketsService extends CrudService<SupportTickets> {
  constructor(
    @InjectRepository(SupportTickets)
    private readonly supportTicketsRepository: Repository<SupportTickets>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly staffNotifications: NotificationsService,
  ) {
    super(supportTicketsRepository);
  }

  override async findAll(
    query: SupportTicketsListQueryDto,
  ): Promise<PaginatedResult<SupportTickets>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [data, total] = await this.supportTicketsRepository.findAndCount({
      where: {
        deletedAt: IsNull(),
        ...(query.status ? { status: query.status } : {}),
        ...(query.priority ? { priority: query.priority } : {}),
      },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
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

  override async create(
    dto: DeepPartial<SupportTickets>,
    actorUserId?: string,
  ): Promise<SupportTickets> {
    const saved = await super.create(dto, actorUserId);
    if (saved.status === 'open') {
      const author = saved.userId
        ? await this.usersRepository.findOne({ where: { id: saved.userId } })
        : null;
      const priority =
        saved.priority === 'urgent' || saved.priority === 'high'
          ? 'high'
          : 'normal';
      void this.staffNotifications.fanOut(
        'support_ticket_open',
        {
          href: '/contenu/support',
          priority,
          ticketId: saved.id,
          status: saved.status,
          authorName: author?.firstName ?? undefined,
        },
        ['support_tickets.read'],
      );
    }
    return saved;
  }
}
