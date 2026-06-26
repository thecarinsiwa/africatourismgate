import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Users } from '../../../entities/generated';
import { EmailService } from '../../email/email.service';
import { webBase } from '../../email/email.templates';
import type { AssistedBookingEmailBase } from '../../email/email.types';
import { BookingEngineService } from './booking-engine.service';

@Injectable()
export class BookingAssistedEmailService {
  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly bookingEngine: BookingEngineService,
    private readonly emailService: EmailService,
  ) {}

  notifyRequestReceived(bookingId: string): void {
    void this.sendRequestReceived(bookingId).catch(() => undefined);
  }

  notifyApproved(bookingId: string): void {
    void this.sendApproved(bookingId).catch(() => undefined);
  }

  notifyRejected(bookingId: string, reason?: string | null): void {
    void this.sendRejected(bookingId, reason).catch(() => undefined);
  }

  notifyPaymentInvite(bookingId: string, paymentUrl: string): void {
    void this.sendPaymentInvite(bookingId, paymentUrl).catch(() => undefined);
  }

  private async buildBasePayload(
    bookingId: string,
  ): Promise<AssistedBookingEmailBase | null> {
    const detail = await this.bookingEngine.getBookingDetail(bookingId);
    const user = await this.usersRepository.findOne({
      where: { id: detail.booking.userId, deletedAt: IsNull() },
    });
    if (!user?.email?.trim()) {
      return null;
    }

    const itemTitles = detail.items
      .map((item) => item.titleSnapshot?.trim())
      .filter((title): title is string => Boolean(title));

    return {
      to: user.email,
      firstName: user.firstName,
      bookingId: detail.booking.id,
      totalCents: detail.totalCents,
      currency: detail.currency,
      itemTitles,
      webUrl: process.env.NEXT_PUBLIC_WEB_URL,
    };
  }

  private chatUrl(bookingId: string, webUrl?: string): string {
    return `${webBase(webUrl)}/account/reservations/${bookingId}/chat`;
  }

  private async sendRequestReceived(bookingId: string): Promise<void> {
    const base = await this.buildBasePayload(bookingId);
    if (!base) {
      return;
    }
    await this.emailService.sendBookingRequestReceived(base);
  }

  private async sendApproved(bookingId: string): Promise<void> {
    const base = await this.buildBasePayload(bookingId);
    if (!base) {
      return;
    }
    await this.emailService.sendBookingApprovedChat({
      ...base,
      chatUrl: this.chatUrl(bookingId, base.webUrl),
    });
  }

  private async sendRejected(bookingId: string, reason?: string | null): Promise<void> {
    const base = await this.buildBasePayload(bookingId);
    if (!base) {
      return;
    }
    await this.emailService.sendBookingRejected({
      ...base,
      reason: reason ?? null,
    });
  }

  private async sendPaymentInvite(bookingId: string, paymentUrl: string): Promise<void> {
    const base = await this.buildBasePayload(bookingId);
    if (!base) {
      return;
    }
    await this.emailService.sendBookingPaymentInvite({
      ...base,
      paymentUrl,
    });
  }
}
