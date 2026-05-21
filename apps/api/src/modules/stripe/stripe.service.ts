import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import Stripe from 'stripe';

type StripeClient = InstanceType<typeof Stripe>;
type StripeEvent = ReturnType<StripeClient['webhooks']['constructEvent']>;
type StripePaymentIntent = Awaited<
  ReturnType<StripeClient['paymentIntents']['retrieve']>
>;
type StripeCheckoutSession = Awaited<
  ReturnType<StripeClient['checkout']['sessions']['retrieve']>
>;
import { newId } from '../../common/utils/uuid';
import { Bookings, Payments } from '../../entities/generated';
import { BookingEngineService } from '../resources/bookings/booking-engine.service';
import {
  STRIPE_METADATA_BOOKING_ID,
  STRIPE_METADATA_PAYMENT_ID,
} from './stripe.constants';

export type BookingPaymentIntentResult = {
  paymentId: string;
  paymentIntentId: string;
  clientSecret: string;
  amountCents: number;
  currency: string;
};

export type BookingCheckoutSessionResult = {
  paymentId: string;
  sessionId: string;
  url: string;
  amountCents: number;
  currency: string;
};

@Injectable()
export class StripeService {
  private readonly logger = new Logger(StripeService.name);
  private stripeClient: StripeClient | null = null;

  constructor(
    @InjectRepository(Bookings)
    private readonly bookingsRepository: Repository<Bookings>,
    @InjectRepository(Payments)
    private readonly paymentsRepository: Repository<Payments>,
    private readonly bookingEngine: BookingEngineService,
  ) {}

  private getStripe(): StripeClient {
    if (this.stripeClient) {
      return this.stripeClient;
    }
    const secret = process.env.STRIPE_SECRET_KEY?.trim();
    if (!secret) {
      throw new ServiceUnavailableException(
        'Stripe n’est pas configuré (STRIPE_SECRET_KEY manquant).',
      );
    }
    this.stripeClient = new Stripe(secret);
    return this.stripeClient;
  }

  getWebhookSecret(): string {
    const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
    if (!secret) {
      throw new ServiceUnavailableException(
        'STRIPE_WEBHOOK_SECRET manquant pour vérifier les webhooks.',
      );
    }
    return secret;
  }

  constructWebhookEvent(payload: Buffer, signature: string): StripeEvent {
    return this.getStripe().webhooks.constructEvent(
      payload,
      signature,
      this.getWebhookSecret(),
    );
  }

  async createPaymentIntentForBooking(
    bookingId: string,
    actorUserId?: string,
  ): Promise<BookingPaymentIntentResult> {
    const booking = await this.findPayableBooking(bookingId);

    const pending = await this.findPendingStripePayment(bookingId);
    if (pending?.externalId?.startsWith('pi_')) {
      const stripe = this.getStripe();
      const existing = await stripe.paymentIntents.retrieve(pending.externalId);
      if (
        existing.status !== 'canceled' &&
        existing.status !== 'succeeded' &&
        existing.client_secret
      ) {
        return {
          paymentId: pending.id,
          paymentIntentId: existing.id,
          clientSecret: existing.client_secret,
          amountCents: booking.totalCents,
          currency: booking.currency,
        };
      }
    }

    const paymentId = newId();
    const stripe = this.getStripe();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: booking.totalCents,
      currency: booking.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        [STRIPE_METADATA_BOOKING_ID]: bookingId,
        [STRIPE_METADATA_PAYMENT_ID]: paymentId,
      },
    });

    const payment = this.paymentsRepository.create({
      id: paymentId,
      bookingId,
      amountCents: booking.totalCents,
      currency: booking.currency,
      status: 'pending',
      provider: 'stripe',
      externalId: paymentIntent.id,
      createdByUserId: actorUserId ?? null,
    } as Payments);
    await this.paymentsRepository.save(payment);

    if (!paymentIntent.client_secret) {
      throw new BadRequestException('PaymentIntent Stripe sans client_secret.');
    }

    return {
      paymentId,
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amountCents: booking.totalCents,
      currency: booking.currency,
    };
  }

  async createCheckoutSessionForBooking(
    bookingId: string,
    actorUserId?: string,
  ): Promise<BookingCheckoutSessionResult> {
    const booking = await this.findPayableBooking(bookingId);
    const paymentId = newId();
    const stripe = this.getStripe();

    const webUrl = (process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3002').replace(
      /\/$/,
      '',
    );

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: booking.currency.toLowerCase(),
            unit_amount: booking.totalCents,
            product_data: {
              name: `Réservation ${bookingId.slice(0, 8)}`,
            },
          },
        },
      ],
      success_url: `${webUrl}/reservations/success?booking_id=${bookingId}`,
      cancel_url: `${webUrl}/reservations/cancel?booking_id=${bookingId}`,
      metadata: {
        [STRIPE_METADATA_BOOKING_ID]: bookingId,
        [STRIPE_METADATA_PAYMENT_ID]: paymentId,
      },
      payment_intent_data: {
        metadata: {
          [STRIPE_METADATA_BOOKING_ID]: bookingId,
          [STRIPE_METADATA_PAYMENT_ID]: paymentId,
        },
      },
    });

    const payment = this.paymentsRepository.create({
      id: paymentId,
      bookingId,
      amountCents: booking.totalCents,
      currency: booking.currency,
      status: 'pending',
      provider: 'stripe',
      externalId: session.id,
      createdByUserId: actorUserId ?? null,
    } as Payments);
    await this.paymentsRepository.save(payment);

    if (!session.url) {
      throw new BadRequestException('Checkout Session Stripe sans URL.');
    }

    return {
      paymentId,
      sessionId: session.id,
      url: session.url,
      amountCents: booking.totalCents,
      currency: booking.currency,
    };
  }

  async handleWebhookEvent(event: StripeEvent): Promise<void> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentIntentSucceeded(event.data.object as StripePaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentIntentFailed(event.data.object as StripePaymentIntent);
        break;
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as StripeCheckoutSession);
        break;
      default:
        this.logger.debug(`Stripe event ignored: ${event.type}`);
    }
  }

  private async handleCheckoutSessionCompleted(
    session: StripeCheckoutSession,
  ): Promise<void> {
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id;
    if (!paymentIntentId) {
      this.logger.warn(`checkout.session.completed without payment_intent: ${session.id}`);
      return;
    }
    const stripe = this.getStripe();
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    await this.handlePaymentIntentSucceeded(intent);
  }

  private async handlePaymentIntentSucceeded(
    intent: StripePaymentIntent,
  ): Promise<void> {
    const bookingId = intent.metadata[STRIPE_METADATA_BOOKING_ID];
    const paymentId = intent.metadata[STRIPE_METADATA_PAYMENT_ID];
    if (!bookingId || !paymentId) {
      this.logger.warn(`payment_intent.succeeded missing metadata: ${intent.id}`);
      return;
    }

    if (intent.status !== 'succeeded') {
      return;
    }

    await this.markPaymentSucceededAndConfirmBooking({
      bookingId,
      paymentId,
      paymentIntentId: intent.id,
      amountCents: intent.amount,
      currency: intent.currency.toUpperCase(),
    });
  }

  private async handlePaymentIntentFailed(intent: StripePaymentIntent): Promise<void> {
    const paymentId = intent.metadata[STRIPE_METADATA_PAYMENT_ID];
    if (!paymentId) return;

    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId, deletedAt: IsNull() },
    });
    if (!payment || payment.status === 'succeeded') return;

    payment.status = 'failed';
    payment.externalId = intent.id;
    await this.paymentsRepository.save(payment);
  }

  private async markPaymentSucceededAndConfirmBooking(params: {
    bookingId: string;
    paymentId: string;
    paymentIntentId: string;
    amountCents: number;
    currency: string;
  }): Promise<void> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: params.bookingId, deletedAt: IsNull() },
    });
    if (!booking) {
      throw new NotFoundException(`Réservation introuvable : ${params.bookingId}.`);
    }

    const payment = await this.paymentsRepository.findOne({
      where: { id: params.paymentId, deletedAt: IsNull() },
    });
    if (!payment) {
      throw new NotFoundException(`Paiement introuvable : ${params.paymentId}.`);
    }

    if (payment.status === 'succeeded') {
      if (booking.status !== 'confirmed') {
        await this.bookingEngine.confirmBooking(
          params.bookingId,
          undefined,
          'Confirmation via webhook Stripe (idempotent)',
        );
      }
      return;
    }

    if (payment.amountCents !== params.amountCents) {
      throw new BadRequestException('Montant Stripe différent du paiement enregistré.');
    }
    if (payment.currency.toUpperCase() !== params.currency) {
      throw new BadRequestException('Devise Stripe différente du paiement enregistré.');
    }

    payment.status = 'succeeded';
    payment.provider = 'stripe';
    payment.externalId = params.paymentIntentId;
    await this.paymentsRepository.save(payment);

    if (booking.status === 'pending_payment') {
      await this.bookingEngine.confirmBooking(
        params.bookingId,
        undefined,
        'Paiement Stripe confirmé (webhook)',
      );
    }
  }

  private async findPayableBooking(bookingId: string): Promise<Bookings> {
    const booking = await this.bookingsRepository.findOne({
      where: { id: bookingId, deletedAt: IsNull() },
    });
    if (!booking) {
      throw new NotFoundException('Réservation introuvable.');
    }
    if (booking.status !== 'pending_payment') {
      throw new BadRequestException(
        `Paiement impossible : statut actuel « ${booking.status} ».`,
      );
    }
    if (booking.totalCents < 1) {
      throw new BadRequestException('Montant de réservation invalide.');
    }
    return booking;
  }

  private async findPendingStripePayment(bookingId: string): Promise<Payments | null> {
    return this.paymentsRepository.findOne({
      where: {
        bookingId,
        provider: 'stripe',
        status: 'pending',
        deletedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
    });
  }
}
