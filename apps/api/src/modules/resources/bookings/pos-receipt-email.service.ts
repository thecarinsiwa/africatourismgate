import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Organizations, Users } from '../../../entities/generated';
import { EmailService } from '../../email/email.service';
import type { SendMailResult } from '../../email/email.types';
import { BookingsService } from './bookings.service';
import {
  buildPosReceiptContext,
  type PosReceiptContext,
  toPosReceiptEmailPayload,
} from './pos-receipt.context';

@Injectable()
export class PosReceiptEmailService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(Organizations)
    private readonly organizationsRepository: Repository<Organizations>,
    private readonly bookingsService: BookingsService,
    private readonly emailService: EmailService,
  ) {}

  async sendReceiptEmail(
    bookingId: string,
    to: string,
    actorUserId: string,
    organizationId: string,
  ): Promise<SendMailResult> {
    const context = await this.resolveReceiptContext(
      bookingId,
      actorUserId,
      organizationId,
    );

    return this.emailService.sendPosReceiptEmail(
      toPosReceiptEmailPayload(context, to),
      context.organizationId,
    );
  }

  async resolveReceiptContext(
    bookingId: string,
    actorUserId: string,
    organizationId: string,
  ): Promise<PosReceiptContext> {
    const detail = await this.bookingsService.getAdminDetail(bookingId);

    if (detail.booking.status !== 'confirmed') {
      throw new BadRequestException(
        'Le reçu ne peut être envoyé que pour une réservation confirmée.',
      );
    }

    const actor = await this.usersRepository.findOne({
      where: { id: actorUserId, deletedAt: IsNull() },
    });
    if (!actor) {
      throw new NotFoundException('Utilisateur introuvable.');
    }

    const organization = await this.organizationsRepository.findOne({
      where: { id: organizationId, deletedAt: IsNull() },
    });
    const organizationName = organization?.name?.trim() ?? '';

    return buildPosReceiptContext(
      detail,
      actor,
      organizationName,
      organizationId,
    );
  }
}
