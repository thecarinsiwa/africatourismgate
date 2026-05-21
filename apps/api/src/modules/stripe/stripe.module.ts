import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Bookings, Payments } from '../../entities/generated';
import { BookingsModule } from '../resources/bookings/bookings.module';
import { StripeService } from './stripe.service';
import { StripeWebhookController } from './stripe-webhook.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Bookings, Payments]),
    forwardRef(() => BookingsModule),
  ],
  controllers: [StripeWebhookController],
  providers: [StripeService],
  exports: [StripeService],
})
export class StripeModule {}
