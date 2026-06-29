import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Bookings, Payments } from '../../../entities/generated';
import { StripeService } from '../../stripe/stripe.service';
import { BookingAssistedEmailService } from './booking-assisted-email.service';
import { BookingNotificationsService } from './booking-notifications.service';

@Injectable()
export class BookingPaymentReminderService {
  private readonly logger = new Logger(BookingPaymentReminderService.name);

  constructor(
    private readonly notifications: BookingNotificationsService,
    private readonly assistedEmail: BookingAssistedEmailService,
    private readonly stripeService: StripeService,
    @InjectRepository(Payments)
    private readonly paymentsRepository: Repository<Payments>,
  ) {}

  async runDueReminders(): Promise<{ scanned: number; sent: number }> {
    const candidates = await this.notifications.listPaymentReminderCandidates();
    let sent = 0;

    for (const booking of candidates) {
      try {
        const paymentUrl = await this.resolvePaymentUrl(booking);
        if (!paymentUrl) {
          continue;
        }
        this.assistedEmail.notifyPaymentReminder(booking.id, paymentUrl);
        await this.notifications.markPaymentReminderSent(booking.id);
        sent += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn(
          `Payment reminder skipped for booking ${booking.id}: ${message}`,
        );
      }
    }

    return { scanned: candidates.length, sent };
  }

  private async resolvePaymentUrl(booking: Bookings): Promise<string | null> {
    const pending = await this.paymentsRepository.findOne({
      where: {
        bookingId: booking.id,
        deletedAt: IsNull(),
        status: 'pending',
        provider: 'stripe',
      },
      order: { createdAt: 'DESC' },
    });
    if (!pending) {
      return null;
    }

    const session = await this.stripeService.getOrCreateCheckoutSessionForBooking(
      booking.id,
      booking.userId,
    );
    return session.url ?? null;
  }
}
