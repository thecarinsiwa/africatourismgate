import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, IsNull, Repository } from 'typeorm';
import { CrudService } from '../../../common/crud/crud.service';
import { newId } from '../../../common/utils/uuid';
import { SupportMessages, SupportTickets } from '../../../entities/generated';
import { PermissionsService } from '../../rbac/permissions.service';
import { SupportTicketMessageDto } from '../support-tickets/dto/support-ticket-created.dto';
import { CreateSupportMessageDto } from './dto/create-support-message.dto';
import { CreateSupportMessageResponseDto } from './dto/create-support-message-response.dto';

@Injectable()
export class SupportMessagesService extends CrudService<SupportMessages> {
  constructor(
    @InjectRepository(SupportMessages)
    private readonly messagesRepository: Repository<SupportMessages>,
    @InjectRepository(SupportTickets)
    private readonly ticketsRepository: Repository<SupportTickets>,
    private readonly permissionsService: PermissionsService,
    private readonly dataSource: DataSource,
  ) {
    super(messagesRepository);
  }

  async createStaffReply(
    dto: CreateSupportMessageDto,
    actorUserId: string,
  ): Promise<CreateSupportMessageResponseDto> {
    const canWrite = await this.canManageTickets(actorUserId);
    if (!canWrite) {
      throw new ForbiddenException('Accès refusé');
    }

    const ticket = await this.ticketsRepository.findOne({
      where: { id: dto.ticketId, deletedAt: IsNull() },
    });
    if (!ticket) {
      throw new NotFoundException('Ticket introuvable.');
    }
    if (ticket.status === 'closed') {
      throw new BadRequestException('Impossible de répondre à un ticket fermé.');
    }

    const body = dto.body.trim();
    const messageId = newId();
    let updatedStatus = ticket.status;

    await this.dataSource.transaction(async (manager) => {
      const ticketsRepo = manager.getRepository(SupportTickets);
      const messagesRepo = manager.getRepository(SupportMessages);

      await messagesRepo.save(
        messagesRepo.create({
          id: messageId,
          ticketId: dto.ticketId,
          userId: actorUserId,
          body,
          isStaff: 1,
          createdByUserId: actorUserId,
        }),
      );

      if (ticket.status === 'open') {
        updatedStatus = 'pending';
        await ticketsRepo.update(dto.ticketId, {
          status: 'pending',
          updatedByUserId: actorUserId,
        });
      }
    });

    const message = await this.messagesRepository.findOneOrFail({
      where: { id: messageId },
    });

    return {
      message: this.toMessageDto(message),
      ticketStatus: updatedStatus,
    };
  }

  private async canManageTickets(userId: string): Promise<boolean> {
    if (await this.permissionsService.hasSuperAdminRole(userId)) {
      return true;
    }
    return this.permissionsService.hasAnyPermission(userId, [
      'support_tickets.write',
    ]);
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
