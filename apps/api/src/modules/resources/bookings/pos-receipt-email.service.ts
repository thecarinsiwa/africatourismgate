import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Organizations, Users } from '../../../entities/generated';
import { EmailService } from '../../email/email.service';
import type { PosReceiptEmailLineItem } from '../../email/email.types';
import type { SendMailResult } from '../../email/email.types';
import { BookingsService } from './bookings.service';
import type { BookingAdminDetailDto } from './dto/booking-admin-detail.dto';

function formatPersonName(firstName: string, lastName: string, fallback: string): string {
  const name = `${firstName} ${lastName}`.trim();
  return name || fallback;
}

function toIsoDate(value: Date | string | null | undefined): string {
  if (!value) {
    return new Date().toISOString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return value;
}

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

    const lineItems = this.buildLineItems(detail);
    const subtotalCents = lineItems.reduce(
      (sum, item) => sum + item.lineTotalCents,
      0,
    );
    const discountCents = Math.max(0, subtotalCents - detail.totalCents);

    const clientName = formatPersonName(
      detail.client.firstName,
      detail.client.lastName,
      'Client',
    );

    return this.emailService.sendPosReceiptEmail(
      {
        to: to.trim(),
        firstName: detail.client.firstName.trim() || 'Client',
        bookingId: detail.booking.id,
        issuedAt: toIsoDate(detail.booking.createdAt),
        organizationName,
        employeeName: formatPersonName(actor.firstName, actor.lastName, '—'),
        clientName,
        paymentMethodLabel: this.resolvePaymentMethodLabel(detail),
        items: lineItems,
        subtotalCents,
        discountCents,
        totalCents: detail.totalCents,
        currency: detail.currency,
        webUrl: process.env.NEXT_PUBLIC_WEB_URL,
      },
      organizationId,
    );
  }

  private buildLineItems(detail: BookingAdminDetailDto): PosReceiptEmailLineItem[] {
    return detail.items.map((item) => ({
      title: item.titleSnapshot?.trim() || 'Prestation',
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      lineTotalCents: item.unitPriceCents * item.quantity,
    }));
  }

  private resolvePaymentMethodLabel(detail: BookingAdminDetailDto): string {
    const succeeded = detail.payments.find((payment) => payment.status === 'succeeded');
    if (succeeded?.provider === 'cash') {
      return 'Espèces';
    }
    if (succeeded?.provider === 'stripe') {
      return 'Carte bancaire';
    }
    if (detail.booking.preferredPaymentMethod === 'cash') {
      return 'Espèces';
    }
    if (detail.booking.preferredPaymentMethod === 'stripe') {
      return 'Carte bancaire';
    }
    return '—';
  }
}
