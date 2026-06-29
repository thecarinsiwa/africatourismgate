/**
 * CE-12: send payment reminders for pending_payment bookings older than 7 days.
 * Run via `pnpm --filter @africatourismgate/api payment-reminders` (cron-friendly).
 */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { BookingPaymentReminderService } from '../modules/resources/bookings/booking-payment-reminder.service';

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const service = app.get(BookingPaymentReminderService);
    const result = await service.runDueReminders();
    console.log(
      `Payment reminders: scanned=${result.scanned} sent=${result.sent}`,
    );
  } finally {
    await app.close();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
