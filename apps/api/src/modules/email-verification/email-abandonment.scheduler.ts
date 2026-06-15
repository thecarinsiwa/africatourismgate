import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Repository } from 'typeorm';
import { Bookings, Users } from '../../entities/generated';
import { EmailVerificationService } from './email-verification.service';
import { EmailService } from '../email/email.service';
import { ABANDONMENT_REMINDER_DELAY_MINUTES } from './email-verification.constants';

@Injectable()
export class EmailAbandonmentScheduler {
  private readonly logger = new Logger(EmailAbandonmentScheduler.name);

  constructor(
    private readonly verificationService: EmailVerificationService,
    private readonly emailService: EmailService,
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    @InjectRepository(Users)
    private readonly usersRepository: Repository<Users>,
  ) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async sendAbandonmentReminders(): Promise<void> {
    const pending = await this.verificationService.findPendingForAbandonmentReminder();
    for (const row of pending) {
      if (row.expiresAt <= new Date()) continue;

      const firstName =
        typeof row.metadata?.firstName === 'string'
          ? row.metadata.firstName
          : 'Client';

      const sent = await this.emailService.sendAbandonmentReminder({
        to: row.email,
        firstName,
        purpose: row.purpose,
        verificationId: row.id,
      });

      if (sent.sent) {
        await this.verificationService.markAbandonmentReminderSent(row.id);
        this.logger.log(
          `Abandonment reminder sent to ${row.email} (${row.purpose})`,
        );
      }
    }

    const cutoff = new Date(
      Date.now() - ABANDONMENT_REMINDER_DELAY_MINUTES * 60 * 1000,
    );
    const draftBookings = await this.bookingsRepository.find({
      where: {
        status: 'draft',
        deletedAt: IsNull(),
        createdAt: LessThan(cutoff),
      },
      take: 20,
    });

    for (const booking of draftBookings) {
      const user = await this.usersRepository.findOne({
        where: { id: booking.userId },
      });
      if (!user?.email) continue;

      void this.emailService
        .sendAbandonmentReminder({
          to: user.email,
          firstName: user.firstName ?? 'Client',
          purpose: 'booking',
          verificationId: booking.id,
        })
        .catch(() => undefined);
    }
  }
}
