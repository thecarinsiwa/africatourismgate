import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { BookingItems, TourGuides, Users } from '../../../entities/generated';
import { BookingDetailPdfService } from '../../email/booking-detail-pdf.service';
import { resolvePdfLocale, type BookingDetailPdfLocale } from '../../email/booking-detail-pdf.labels';
import { EmailService } from '../../email/email.service';
import { BookingEngineService } from '../bookings/booking-engine.service';
import { BookingManifestService } from '../bookings/booking-manifest.service';
import { TourGuidesService } from './tour-guides.service';

type BookingGuideRole = 'primary' | 'secondary';

@Injectable()
export class BookingGuideAssignmentEmailService {
  private readonly logger = new Logger(BookingGuideAssignmentEmailService.name);

  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    private readonly tourGuidesService: TourGuidesService,
    private readonly bookingEngine: BookingEngineService,
    private readonly manifestService: BookingManifestService,
    private readonly bookingDetailPdf: BookingDetailPdfService,
    private readonly emailService: EmailService,
  ) {}

  notifyGuideAssigned(
    bookingId: string,
    guideId: string,
    role: BookingGuideRole,
  ): void {
    void this.sendGuideAssigned(bookingId, guideId, role).catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `E-mail d'assignation guide non envoyé (${bookingId}/${guideId}) : ${message}`,
      );
    });
  }

  private async sendGuideAssigned(
    bookingId: string,
    guideId: string,
    role: BookingGuideRole,
  ): Promise<void> {
    const guide = await this.tourGuidesService.requireActiveGuide(guideId);
    const recipient = await this.resolveGuideRecipient(guide);
    if (!recipient) {
      this.logger.debug(
        `Pas d'e-mail pour le guide ${guideId} (${guide.displayName}), notification ignorée.`,
      );
      return;
    }

    const detail = await this.bookingEngine.getBookingDetail(bookingId);
    const bookingCustomer = await this.usersRepository.findOne({
      where: { id: detail.booking.userId, deletedAt: IsNull() },
    });

    const itemTitles = detail.items
      .map((item) => item.titleSnapshot?.trim())
      .filter((title): title is string => Boolean(title));

    const { visitStartDate, visitEndDate } = deriveVisitDates(detail.items);
    const adminBase = process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, '');
    const adminUrl = adminBase ? `${adminBase}/reservations/${bookingId}` : undefined;
    const locale = resolveGuideLocale(guide, recipient.preferredLanguage);
    const webUrl = process.env.NEXT_PUBLIC_WEB_URL;

    let attachments:
      | Array<{ filename: string; content: Buffer; contentType: string }>
      | undefined;
    let hasPdfAttachment = false;

    try {
      const manifest = await this.manifestService.listForBooking(bookingId);
      const pdf = await this.bookingDetailPdf.generate({
        detail,
        manifest,
        customer: {
          firstName: bookingCustomer?.firstName ?? 'Client',
          lastName: bookingCustomer?.lastName ?? '',
          email: bookingCustomer?.email ?? recipient.email,
          preferredLanguage: locale,
          organizationId: bookingCustomer?.organizationId ?? null,
        },
        webUrl,
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
        `PDF récapitulatif non généré pour l'assignation guide (${bookingId}/${guideId}) : ${message}`,
      );
    }

    await this.emailService.sendBookingGuideAssignment(
      {
        to: recipient.email,
        guideName: guide.displayName,
        bookingId,
        role,
        itemTitles,
        visitStartDate,
        visitEndDate,
        adminUrl,
        locale,
        webUrl,
        hasPdfAttachment,
      },
      { attachments },
    );
  }

  private async resolveGuideRecipient(
    guide: TourGuides,
  ): Promise<{ email: string; preferredLanguage?: string | null } | null> {
    if (guide.userId) {
      const user = await this.usersRepository.findOne({
        where: { id: guide.userId, deletedAt: IsNull() },
      });
      if (!user?.email?.trim()) {
        return null;
      }

      return {
        email: user.email,
        preferredLanguage: user.preferredLanguage,
      };
    }

    const contactEmail = guide.contactEmail?.trim();
    if (!contactEmail) {
      return null;
    }

    return { email: contactEmail };
  }
}

function deriveVisitDates(items: BookingItems[]): {
  visitStartDate: string | null;
  visitEndDate: string | null;
} {
  const startDates = items
    .map((item) => item.startDate?.slice(0, 10))
    .filter((date): date is string => Boolean(date))
    .sort();

  const endDates = items
    .map((item) => (item.endDate ?? item.startDate)?.slice(0, 10))
    .filter((date): date is string => Boolean(date))
    .sort();

  return {
    visitStartDate: startDates[0] ?? null,
    visitEndDate: endDates[endDates.length - 1] ?? null,
  };
}

function resolveGuideLocale(
  guide: TourGuides,
  preferredLanguage?: string | null,
): BookingDetailPdfLocale {
  if (preferredLanguage?.trim()) {
    return resolvePdfLocale(preferredLanguage);
  }

  const firstLanguage = guide.languages?.[0]?.trim().slice(0, 2).toLowerCase();
  if (firstLanguage === 'en' || firstLanguage === 'es' || firstLanguage === 'fr') {
    return firstLanguage;
  }

  return 'fr';
}
