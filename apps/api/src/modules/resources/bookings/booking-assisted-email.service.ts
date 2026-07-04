import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Users } from '../../../entities/generated';
import { BookingDetailPdfService } from '../../email/booking-detail-pdf.service';
import { resolvePdfLocale } from '../../email/booking-detail-pdf.labels';
import { EmailService } from '../../email/email.service';
import { webBase } from '../../email/email.templates';
import type { AssistedBookingEmailBase } from '../../email/email.types';
import { BookingEngineService } from './booking-engine.service';
import { BookingManifestService } from './booking-manifest.service';

@Injectable()
export class BookingAssistedEmailService {
  private readonly logger = new Logger(BookingAssistedEmailService.name);

  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly bookingEngine: BookingEngineService,
    private readonly manifestService: BookingManifestService,
    private readonly emailService: EmailService,
    private readonly bookingDetailPdf: BookingDetailPdfService,
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

  notifyStaffMessage(bookingId: string, messageBody: string): void {
    void this.sendStaffMessage(bookingId, messageBody).catch(() => undefined);
  }

  notifyPaymentReminder(bookingId: string, paymentUrl: string): void {
    void this.sendPaymentReminder(bookingId, paymentUrl).catch(() => undefined);
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
    const detail = await this.bookingEngine.getBookingDetail(bookingId);
    const user = await this.usersRepository.findOne({
      where: { id: detail.booking.userId, deletedAt: IsNull() },
    });
    if (!user?.email?.trim()) {
      return;
    }

    const itemTitles = detail.items
      .map((item) => item.titleSnapshot?.trim())
      .filter((title): title is string => Boolean(title));

    const base: AssistedBookingEmailBase = {
      to: user.email,
      firstName: user.firstName,
      bookingId: detail.booking.id,
      totalCents: detail.totalCents,
      currency: detail.currency,
      itemTitles,
      webUrl: process.env.NEXT_PUBLIC_WEB_URL,
    };

    const locale = resolvePdfLocale(user.preferredLanguage);
    const manifest = await this.manifestService.listForBooking(bookingId);

    let attachments:
      | Array<{ filename: string; content: Buffer; contentType: string }>
      | undefined;
    let hasPdfAttachment = false;

    try {
      const pdf = await this.bookingDetailPdf.generate({
        detail,
        manifest,
        customer: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          preferredLanguage: user.preferredLanguage,
          organizationId: user.organizationId,
        },
        webUrl: base.webUrl,
      });
      attachments = [
        {
          filename: pdf.filename,
          content: pdf.buffer,
          contentType: 'application/pdf',
        },
      ];
      hasPdfAttachment = true;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `PDF récapitulatif non généré pour la réservation ${bookingId} : ${message}`,
      );
    }

    await this.emailService.sendBookingApprovedChat(
      {
        ...base,
        chatUrl: this.chatUrl(bookingId, base.webUrl),
        locale,
        hasPdfAttachment,
      },
      { attachments },
    );
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
    const manifest = await this.manifestService.listForBooking(bookingId);
    const travelerPricing = manifest
      .filter((entry) => entry.priceCents != null && entry.priceCents >= 0)
      .map((entry) => ({
        fullName: entry.fullName,
        priceCents: entry.priceCents as number,
      }));
    await this.emailService.sendBookingPaymentInvite({
      ...base,
      paymentUrl,
      travelerPricing: travelerPricing.length > 0 ? travelerPricing : undefined,
    });
  }

  private messagePreview(body: string): string {
    const trimmed = body.trim();
    if (trimmed.length <= 280) {
      return trimmed;
    }
    return `${trimmed.slice(0, 277)}…`;
  }

  private async sendStaffMessage(bookingId: string, messageBody: string): Promise<void> {
    const base = await this.buildBasePayload(bookingId);
    if (!base) {
      return;
    }
    await this.emailService.sendBookingStaffMessage({
      ...base,
      chatUrl: this.chatUrl(bookingId, base.webUrl),
      messagePreview: this.messagePreview(messageBody),
    });
  }

  private async sendPaymentReminder(bookingId: string, paymentUrl: string): Promise<void> {
    const base = await this.buildBasePayload(bookingId);
    if (!base) {
      return;
    }
    await this.emailService.sendBookingPaymentReminder({
      ...base,
      paymentUrl,
    });
  }
}
