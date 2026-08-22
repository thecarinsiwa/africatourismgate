import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { BookingItems, TourGuides, Users } from '../../../entities/generated';
import { resolvePdfLocale, type BookingDetailPdfLocale } from '../../email/booking-detail-pdf.labels';
import { EmailService } from '../../email/email.service';
import { TourGuidesService } from './tour-guides.service';

type BookingGuideRole = 'primary' | 'secondary';

@Injectable()
export class BookingGuideAssignmentEmailService {
  private readonly logger = new Logger(BookingGuideAssignmentEmailService.name);

  constructor(
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
    @InjectRepository(BookingItems)
    private readonly bookingItemsRepository: Repository<BookingItems>,
    private readonly tourGuidesService: TourGuidesService,
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

    const items = await this.bookingItemsRepository.find({
      where: { bookingId, deletedAt: IsNull() },
      order: { startDate: 'ASC', createdAt: 'ASC' },
    });

    const itemTitles = items
      .map((item) => item.titleSnapshot?.trim())
      .filter((title): title is string => Boolean(title));

    const { visitStartDate, visitEndDate } = deriveVisitDates(items);
    const adminBase = process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, '');
    const adminUrl = adminBase ? `${adminBase}/reservations/${bookingId}` : undefined;

    await this.emailService.sendBookingGuideAssignment({
      to: recipient.email,
      guideName: guide.displayName,
      bookingId,
      role,
      itemTitles,
      visitStartDate,
      visitEndDate,
      adminUrl,
      locale: resolveGuideLocale(guide, recipient.preferredLanguage),
      webUrl: process.env.NEXT_PUBLIC_WEB_URL,
    });
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
