import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  PaginatedResult,
  PaginationQueryDto,
} from '../../../common/dto/pagination-query.dto';
import { CrudService } from '../../../common/crud/crud.service';
import { newId } from '../../../common/utils/uuid';
import { SupportMessages, SupportTickets } from '../../../entities/generated';
import { PermissionsService } from '../../rbac/permissions.service';
import { CreateSupportTicketDto } from './dto/create-support-ticket.dto';
import {
  SupportTicketCreatedDto,
  SupportTicketDto,
  SupportTicketMessageDto,
} from './dto/support-ticket-created.dto';

@Injectable()
export class SupportTicketsService extends CrudService<SupportTickets> {
  constructor(
    @InjectRepository(SupportTickets)
    private readonly ticketsRepository: Repository<SupportTickets>,
    private readonly permissionsService: PermissionsService,
  ) {
    super(ticketsRepository);
  }

  private async isStaff(userId: string): Promise<boolean> {
    return this.permissionsService.hasAnyPermission(userId, ['users.read']);
  }

  private toTicketDto(ticket: SupportTickets): SupportTicketDto {
    return {
      id: ticket.id,
      userId: ticket.userId,
      subject: ticket.subject,
      status: ticket.status,
      createdAt: ticket.createdAt.toISOString(),
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

  async listForUser(
    query: PaginationQueryDto,
    currentUserId: string,
  ): Promise<PaginatedResult<SupportTicketDto>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const staff = await this.isStaff(currentUserId);

    const qb = this.ticketsRepository
      .createQueryBuilder('ticket')
      .where('ticket.deletedAt IS NULL')
      .orderBy('ticket.createdAt', 'DESC');

    if (!staff) {
      qb.andWhere('ticket.userId = :userId', { userId: currentUserId });
    }

    const [rows, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

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

  async findOneForUser(
    id: string,
    currentUserId: string,
  ): Promise<SupportTicketDto> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!ticket) {
      throw new NotFoundException(`Resource ${id} not found`);
    }

    const staff = await this.isStaff(currentUserId);
    if (!staff && ticket.userId !== currentUserId) {
      throw new ForbiddenException('Accès refusé');
    }

    return this.toTicketDto(ticket);
  }

  async createWithInitialMessage(
    dto: CreateSupportTicketDto,
    currentUserId: string,
  ): Promise<SupportTicketCreatedDto> {
    const staff = await this.isStaff(currentUserId);
    const targetUserId =
      staff && dto.userId ? dto.userId : currentUserId;

    if (!staff && dto.userId && dto.userId !== currentUserId) {
      throw new ForbiddenException('Accès refusé');
    }

    const subject = dto.subject.trim();
    const body = dto.body.trim();
    const actorUserId = currentUserId;

    const result = await this.ticketsRepository.manager.transaction(
      async (manager) => {
        const ticketRepo = manager.getRepository(SupportTickets);
        const messageRepo = manager.getRepository(SupportMessages);

        const ticketId = newId();
        const ticket = ticketRepo.create({
          id: ticketId,
          userId: targetUserId,
          subject,
          status: 'open',
          createdByUserId: actorUserId,
        });
        await ticketRepo.save(ticket);

        const messageId = newId();
        const message = messageRepo.create({
          id: messageId,
          ticketId,
          userId: targetUserId,
          body,
          isStaff: 0,
          createdByUserId: actorUserId,
        });
        await messageRepo.save(message);

        return { ticket, message };
      },
    );

    return {
      ticket: this.toTicketDto(result.ticket),
      initialMessage: this.toMessageDto(result.message),
    };
  }

  async assertStaffOrOwnerForMutation(
    id: string,
    currentUserId: string,
  ): Promise<SupportTickets> {
    const ticket = await this.ticketsRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!ticket) {
      throw new NotFoundException(`Resource ${id} not found`);
    }

    const staff = await this.isStaff(currentUserId);
    if (!staff && ticket.userId !== currentUserId) {
      throw new ForbiddenException('Accès refusé');
    }

    return ticket;
  }
}
