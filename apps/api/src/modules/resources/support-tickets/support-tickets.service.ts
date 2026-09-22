import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, IsNull, Repository } from 'typeorm';
import { PaginatedResult } from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { newId } from '../../../common/utils/uuid';
import {
  SupportMessages,
  SupportTickets,
  Users,
} from '../../../entities/generated';
import { PermissionsService } from '../../rbac/permissions.service';
import { NotificationsService } from '../notifications/notifications.service';
import { AdminSupportTicketDetailDto } from './dto/admin-support-ticket-detail.dto';
import { AdminSupportTicketListItemDto } from './dto/admin-support-ticket-list-item.dto';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import {
  SupportTicketCreatedDto,
  SupportTicketDto,
  SupportTicketMessageDto,
} from './dto/support-ticket-created.dto';
import { SupportTicketsListQueryDto } from './dto/support-tickets-list-query.dto';
import { UpdateSupportTicketStatusDto } from './dto/update-support-ticket-status.dto';

type AdminTicketRow = {
  id: string;
  userId: string;
  subject: string;
  status: SupportTickets['status'];
  priority: SupportTickets['priority'];
  createdAt: Date;
  customerFirstName: string | null;
  customerEmail: string | null;
};

type LastMessageInfo = {
  preview: string | null;
  at: string | null;
  isStaff: boolean | null;
};

const LAST_MESSAGE_PREVIEW_MAX = 160;

@Injectable()
export class SupportTicketsService extends CrudService<SupportTickets> {
  constructor(
    @InjectRepository(SupportTickets)
    private readonly ticketsRepository: Repository<SupportTickets>,
    @InjectRepository(SupportMessages)
    private readonly messagesRepository: Repository<SupportMessages>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly permissionsService: PermissionsService,
    private readonly dataSource: DataSource,
    private readonly staffNotifications: NotificationsService,
  ) {
    super(ticketsRepository);
  }

  async createTicket(
    dto: CreateSupportTicketDto,
    actorUserId: string,
  ): Promise<SupportTicketCreatedDto> {
    let ownerUserId = actorUserId;
    if (dto.userId) {
      const staff = await this.canManageTickets(actorUserId);
      if (!staff) {
        throw new ForbiddenException(
          'Le champ userId est réservé au personnel autorisé.',
        );
      }
      const customer = await this.usersRepository.findOne({
        where: { id: dto.userId, deletedAt: IsNull() },
      });
      if (!customer) {
        throw new NotFoundException('Client introuvable.');
      }
      ownerUserId = customer.id;
    }

    const ticketId = newId();
    const messageId = newId();

    await this.dataSource.transaction(async (manager) => {
      const ticketsRepo = manager.getRepository(SupportTickets);
      const messagesRepo = manager.getRepository(SupportMessages);

      await ticketsRepo.save(
        ticketsRepo.create({
          id: ticketId,
          userId: ownerUserId,
          subject: dto.subject.trim(),
          status: 'open',
          priority: 'normal',
          createdByUserId: actorUserId,
        }),
      );

      await messagesRepo.save(
        messagesRepo.create({
          id: messageId,
          ticketId,
          userId: ownerUserId,
          body: dto.body.trim(),
          isStaff: 0,
          createdByUserId: actorUserId,
        }),
      );
    });

    const ticket = await this.ticketsRepository.findOneOrFail({
      where: { id: ticketId },
    });
    const message = await this.messagesRepository.findOneOrFail({
      where: { id: messageId },
    });

    const author = await this.usersRepository.findOne({
      where: { id: ownerUserId },
    });
    void this.staffNotifications.fanOut(
      'support_ticket_open',
      {
        href: `/contenu/tickets/${ticket.id}`,
        priority: 'normal',
        ticketId: ticket.id,
        status: ticket.status,
        authorName: author?.firstName ?? undefined,
      },
      ['support_tickets.read'],
    );

    return {
      ticket: this.toTicketDto(ticket),
      initialMessage: this.toMessageDto(message),
    };
  }

  async list(
    query: SupportTicketsListQueryDto,
    actorUserId: string,
  ): Promise<PaginatedResult<SupportTicketDto | AdminSupportTicketListItemDto>> {
    const staff = await this.canReadTickets(actorUserId);
    if (staff) {
      return this.listForAdmin(query);
    }
    return this.listForCustomer(query, actorUserId);
  }

  async findOneForActor(
    id: string,
    actorUserId: string,
  ): Promise<SupportTicketDto | AdminSupportTicketDetailDto> {
    const staff = await this.canReadTickets(actorUserId);
    if (staff) {
      return this.findOneForAdmin(id);
    }
    return this.findOneForCustomer(id, actorUserId);
  }

  async updateTicket(
    id: string,
    dto: UpdateSupportTicketStatusDto,
    actorUserId: string,
  ): Promise<AdminSupportTicketDetailDto> {
    const canWrite = await this.canManageTickets(actorUserId);
    if (!canWrite) {
      throw new ForbiddenException('Accès refusé');
    }
    if (dto.status === undefined && dto.priority === undefined) {
      throw new BadRequestException('Aucune modification fournie.');
    }

    const ticket = await this.ticketsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket introuvable.');
    }

    if (dto.status !== undefined) {
      ticket.status = dto.status;
    }
    if (dto.priority !== undefined) {
      ticket.priority = dto.priority;
    }
    ticket.updatedByUserId = actorUserId;
    await this.ticketsRepository.save(ticket);

    return this.findOneForAdmin(id);
  }

  async removeTicket(id: string, actorUserId: string): Promise<void> {
    const canWrite = await this.canManageTickets(actorUserId);
    if (!canWrite) {
      throw new ForbiddenException('Accès refusé');
    }
    await this.remove(id, actorUserId);
  }

  private async listForCustomer(
    query: SupportTicketsListQueryDto,
    userId: string,
  ): Promise<PaginatedResult<SupportTicketDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const qb = this.ticketsRepository
      .createQueryBuilder('t')
      .where('t.deletedAt IS NULL')
      .andWhere('t.userId = :userId', { userId })
      .orderBy('t.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      qb.andWhere('t.status = :status', { status: query.status });
    }
    if (query.priority) {
      qb.andWhere('t.priority = :priority', { priority: query.priority });
    }

    const [rows, total] = await qb.getManyAndCount();

    return {
      data: rows.map((row) => this.toTicketDto(row)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  private async listForAdmin(
    query: SupportTicketsListQueryDto,
  ): Promise<PaginatedResult<AdminSupportTicketListItemDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortByLastMessage = query.sortBy === 'lastMessageAt';

    const qb = this.ticketsRepository
      .createQueryBuilder('t')
      .innerJoin(Users, 'u', 'u.id = t.userId AND u.deletedAt IS NULL')
      .select('t.id', 'id')
      .addSelect('t.userId', 'userId')
      .addSelect('t.subject', 'subject')
      .addSelect('t.status', 'status')
      .addSelect('t.priority', 'priority')
      .addSelect('t.createdAt', 'createdAt')
      .addSelect('u.firstName', 'customerFirstName')
      .addSelect('u.email', 'customerEmail')
      .where('t.deletedAt IS NULL');

    if (query.status) {
      qb.andWhere('t.status = :status', { status: query.status });
    }
    if (query.priority) {
      qb.andWhere('t.priority = :priority', { priority: query.priority });
    }

    if (sortByLastMessage) {
      qb.addSelect(
        `(SELECT MAX(m.created_at) FROM support_messages m WHERE m.ticket_id = t.id AND m.deleted_at IS NULL)`,
        'lastActivityAt',
      )
        .orderBy('lastActivityAt', 'DESC')
        .addOrderBy('t.createdAt', 'DESC');
    } else {
      qb.orderBy('t.createdAt', 'DESC');
    }

    qb.offset((page - 1) * limit).limit(limit);

    const countQb = this.ticketsRepository
      .createQueryBuilder('t')
      .where('t.deletedAt IS NULL');
    if (query.status) {
      countQb.andWhere('t.status = :status', { status: query.status });
    }
    if (query.priority) {
      countQb.andWhere('t.priority = :priority', { priority: query.priority });
    }

    const [rows, total] = await Promise.all([
      qb.getRawMany<AdminTicketRow>(),
      countQb.getCount(),
    ]);

    const lastByTicket = await this.loadLastMessagesByTicketIds(
      rows.map((row) => row.id),
    );

    return {
      data: rows.map((row) =>
        this.toAdminListItemDto(row, lastByTicket.get(row.id)),
      ),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  private async loadLastMessagesByTicketIds(
    ticketIds: string[],
  ): Promise<Map<string, LastMessageInfo>> {
    const map = new Map<string, LastMessageInfo>();
    if (ticketIds.length === 0) return map;

    const messages = await this.messagesRepository.find({
      where: { ticketId: In(ticketIds), deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });

    for (const message of messages) {
      if (map.has(message.ticketId)) continue;
      map.set(message.ticketId, {
        preview: this.previewMessageBody(message.body),
        at:
          message.createdAt instanceof Date
            ? message.createdAt.toISOString()
            : new Date(message.createdAt).toISOString(),
        isStaff: message.isStaff === 1,
      });
    }

    return map;
  }

  private previewMessageBody(body: string): string {
    const normalized = body.replace(/\s+/g, ' ').trim();
    if (normalized.length <= LAST_MESSAGE_PREVIEW_MAX) return normalized;
    return `${normalized.slice(0, LAST_MESSAGE_PREVIEW_MAX - 1)}…`;
  }

  private async findOneForCustomer(
    id: string,
    userId: string,
  ): Promise<SupportTicketDto> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket introuvable.');
    }
    if (ticket.userId !== userId) {
      throw new ForbiddenException('Accès refusé');
    }
    return this.toTicketDto(ticket);
  }

  async findOneForAdmin(id: string): Promise<AdminSupportTicketDetailDto> {
    const row = await this.ticketsRepository
      .createQueryBuilder('t')
      .innerJoin(Users, 'u', 'u.id = t.userId AND u.deletedAt IS NULL')
      .select('t.id', 'id')
      .addSelect('t.userId', 'userId')
      .addSelect('t.subject', 'subject')
      .addSelect('t.status', 'status')
      .addSelect('t.priority', 'priority')
      .addSelect('t.createdAt', 'createdAt')
      .addSelect('u.firstName', 'customerFirstName')
      .addSelect('u.email', 'customerEmail')
      .where('t.id = :id', { id })
      .andWhere('t.deletedAt IS NULL')
      .getRawOne<AdminTicketRow>();

    if (!row) {
      throw new NotFoundException('Ticket introuvable.');
    }

    const messages = await this.messagesRepository.find({
      where: { ticketId: id, deletedAt: IsNull() },
      order: { createdAt: 'ASC' },
    });

    const lastMessage = messages[messages.length - 1];
    const last = lastMessage
      ? {
          preview: this.previewMessageBody(lastMessage.body),
          at:
            lastMessage.createdAt instanceof Date
              ? lastMessage.createdAt.toISOString()
              : new Date(lastMessage.createdAt).toISOString(),
          isStaff: lastMessage.isStaff === 1,
        }
      : undefined;

    return {
      ...this.toAdminListItemDto(row, last),
      messages: messages.map((message) => this.toMessageDto(message)),
    };
  }

  private async canReadTickets(userId: string): Promise<boolean> {
    if (await this.permissionsService.hasSuperAdminRole(userId)) {
      return true;
    }
    return this.permissionsService.hasAnyPermission(userId, [
      'support_tickets.read',
    ]);
  }

  private async canManageTickets(userId: string): Promise<boolean> {
    if (await this.permissionsService.hasSuperAdminRole(userId)) {
      return true;
    }
    return this.permissionsService.hasAnyPermission(userId, [
      'support_tickets.write',
    ]);
  }

  private toTicketDto(ticket: SupportTickets): SupportTicketDto {
    return {
      id: ticket.id,
      userId: ticket.userId,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt.toISOString(),
    };
  }

  private toAdminListItemDto(
    row: AdminTicketRow,
    last?: LastMessageInfo,
  ): AdminSupportTicketListItemDto {
    return {
      id: row.id,
      userId: row.userId,
      subject: row.subject,
      status: row.status,
      priority: row.priority,
      createdAt:
        row.createdAt instanceof Date
          ? row.createdAt.toISOString()
          : new Date(row.createdAt).toISOString(),
      customerFirstName: row.customerFirstName,
      customerEmail: row.customerEmail,
      lastMessagePreview: last?.preview ?? null,
      lastMessageAt: last?.at ?? null,
      lastMessageIsStaff: last?.isStaff ?? null,
    };
  }

  private toMessageDto(message: SupportMessages): SupportTicketMessageDto {
    return {
      id: message.id,
      ticketId: message.ticketId,
      body: message.body,
      isStaff: message.isStaff === 1,
      createdAt: message.createdAt.toISOString(),
    };
  }
}
