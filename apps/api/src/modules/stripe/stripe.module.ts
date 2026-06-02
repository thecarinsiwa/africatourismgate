import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookings, Payments } from '../../entities/generated';
import { BookingsModule } from '../resources/bookings/bookings.module';
import { LoyaltyAccountsModule } from '../resources/loyalty-accounts/loyalty-accounts.module';
import { StripeService } from './stripe.service';
import { StripeWebhookController } from './stripe-webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bookings, Payments]),
    forwardRef(() => BookingsModule),
    LoyaltyAccountsModule,
  ],
  controllers: [StripeWebhookController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
