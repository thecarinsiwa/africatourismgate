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
type StripeRefund = Awaited<ReturnType<StripeClient['refunds']['retrieve']>>;
type StripeCharge = Awaited<ReturnType<StripeClient['charges']['retrieve']>>;
import { newId } from '../../common/utils/uuid';
import { Bookings, Payments } from '../../entities/generated';
import { BookingEngineService } from '../resources/bookings/booking-engine.service';
import { LoyaltyAccountsService } from '../resources/loyalty-accounts/loyalty-accounts.service';
import {
  STRIPE_METADATA_BOOKING_ID,
  STRIPE_METADATA_PAYMENT_ID,
  STRIPE_PROVIDER,
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

export type RefundPaymentResult = {
  refundId: string;
  amountCents: number;
  stripeStatus: string;
  paymentId: string;
  bookingId: string;
  paymentStatus: Payments['status'];
  bookingStatus: Bookings['status'];
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
    private readonly loyaltyAccountsService: LoyaltyAccountsService,
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
    return this.getOrCreateCheckoutSessionForBooking(bookingId, actorUserId);
  }

  async getOrCreateCheckoutSessionForBooking(
    bookingId: string,
    actorUserId?: string,
  ): Promise<BookingCheckoutSessionResult> {
    const booking = await this.findPayableBooking(bookingId);

    const pending = await this.findPendingStripePayment(bookingId);
    if (pending?.externalId?.startsWith('cs_')) {
      const stripe = this.getStripe();
      const existing = await stripe.checkout.sessions.retrieve(pending.externalId);
      if (existing.status === 'open' && existing.url) {
        return {
          paymentId: pending.id,
          sessionId: existing.id,
          url: existing.url,
          amountCents: booking.totalCents,
          currency: booking.currency,
        };
      }
    }

    const paymentId = newId();
    const stripe = this.getStripe();

    const defaultWebUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://africatourismgate.org'
        : 'http://localhost:3002';
    const webUrl = (process.env.NEXT_PUBLIC_WEB_URL ?? defaultWebUrl).replace(/\/$/, '');

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
      success_url: `${webUrl}/booking/success?booking_id=${bookingId}`,
      cancel_url: `${webUrl}/booking/cancel?booking_id=${bookingId}`,
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

  async createRefundForPayment(
    paymentId: string,
    amountCents?: number,
    actorUserId?: string,
  ): Promise<RefundPaymentResult> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId, deletedAt: IsNull() },
    });
    if (!payment) {
      throw new NotFoundException('Paiement introuvable.');
    }

    if (payment.status === 'refunded') {
      throw new BadRequestException('Ce paiement est déjà entièrement remboursé.');
    }
    if (payment.status !== 'succeeded') {
      throw new BadRequestException(
        `Remboursement impossible : statut paiement « ${payment.status} ».`,
      );
    }
    if (payment.provider !== STRIPE_PROVIDER) {
      throw new BadRequestException('Remboursement réservé aux paiements Stripe.');
    }

    const booking = await this.bookingsRepository.findOne({
      where: { id: payment.bookingId, deletedAt: IsNull() },
    });
    if (!booking) {
      throw new NotFoundException('Réservation introuvable.');
    }
    if (booking.status !== 'cancelled') {
      throw new BadRequestException(
        `Remboursement impossible : la réservation doit être annulée (statut actuel « ${booking.status} »).`,
      );
    }

    const paymentIntentId = await this.resolvePaymentIntentId(payment.externalId);
    const stripe = this.getStripe();
    const refundedSoFar = await this.getTotalRefundedCents(paymentIntentId);
    const remaining = payment.amountCents - refundedSoFar;

    if (remaining < 1) {
      throw new BadRequestException('Ce paiement est déjà entièrement remboursé sur Stripe.');
    }

    const refundAmount = amountCents ?? remaining;
    if (refundAmount < 1 || refundAmount > remaining) {
      throw new BadRequestException(
        `Montant invalide : ${refundAmount} centimes (reste remboursable : ${remaining}).`,
      );
    }

    const idempotencyKey = `refund-${paymentId}-${refundAmount}`;
    const refund = await stripe.refunds.create(
      {
        payment_intent: paymentIntentId,
        amount: refundAmount,
        metadata: {
          [STRIPE_METADATA_BOOKING_ID]: payment.bookingId,
          [STRIPE_METADATA_PAYMENT_ID]: paymentId,
        },
      },
      { idempotencyKey },
    );

    if (refund.status === 'succeeded') {
      await this.markPaymentRefundedAndFinalizeBooking({
        paymentId,
        bookingId: payment.bookingId,
        paymentIntentId,
        actorUserId,
      });
    }

    const updatedPayment = await this.paymentsRepository.findOne({
      where: { id: paymentId, deletedAt: IsNull() },
    });
    const updatedBooking = await this.bookingsRepository.findOne({
      where: { id: payment.bookingId, deletedAt: IsNull() },
    });

    return {
      refundId: refund.id,
      amountCents: refundAmount,
      stripeStatus: refund.status ?? 'pending',
      paymentId,
      bookingId: payment.bookingId,
      paymentStatus: updatedPayment?.status ?? payment.status,
      bookingStatus: updatedBooking?.status ?? booking.status,
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
      case 'refund.updated':
        await this.handleRefundUpdated(event.data.object as StripeRefund);
        break;
      case 'charge.refunded':
        await this.handleChargeRefunded(event.data.object as StripeCharge);
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

    try {
      await this.loyaltyAccountsService.awardPointsForSucceededPayment(booking, payment);
    } catch (err) {
      this.logger.error(
        `OneKey points award failed for payment ${payment.id}: ${err instanceof Error ? err.message : err}`,
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
        provider: STRIPE_PROVIDER,
        status: 'pending',
        deletedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
    });
  }

  private async handleRefundUpdated(refund: StripeRefund): Promise<void> {
    if (refund.status !== 'succeeded') {
      return;
    }

    const paymentId = refund.metadata?.[STRIPE_METADATA_PAYMENT_ID];
    const bookingId = refund.metadata?.[STRIPE_METADATA_BOOKING_ID];
    if (!paymentId || !bookingId) {
      this.logger.warn(`refund.updated missing metadata: ${refund.id}`);
      return;
    }

    const paymentIntentId =
      typeof refund.payment_intent === 'string'
        ? refund.payment_intent
        : refund.payment_intent?.id;
    if (!paymentIntentId) {
      this.logger.warn(`refund.updated without payment_intent: ${refund.id}`);
      return;
    }

    await this.markPaymentRefundedAndFinalizeBooking({
      paymentId,
      bookingId,
      paymentIntentId,
    });
  }

  private async handleChargeRefunded(charge: StripeCharge): Promise<void> {
    const paymentIntentId =
      typeof charge.payment_intent === 'string'
        ? charge.payment_intent
        : charge.payment_intent?.id;
    if (!paymentIntentId) {
      return;
    }

    const stripe = this.getStripe();
    const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
    const paymentId = intent.metadata[STRIPE_METADATA_PAYMENT_ID];
    const bookingId = intent.metadata[STRIPE_METADATA_BOOKING_ID];
    if (!paymentId || !bookingId) {
      return;
    }

    await this.markPaymentRefundedAndFinalizeBooking({
      paymentId,
      bookingId,
      paymentIntentId,
    });
  }

  private async markPaymentRefundedAndFinalizeBooking(params: {
    paymentId: string;
    bookingId: string;
    paymentIntentId: string;
    actorUserId?: string;
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

    if (payment.status === 'refunded') {
      if (booking.status !== 'refunded') {
        await this.bookingEngine.markBookingRefunded(
          params.bookingId,
          params.actorUserId,
          'Remboursement via webhook Stripe (idempotent)',
        );
      }
      return;
    }

    if (payment.status !== 'succeeded') {
      return;
    }

    const totalRefunded = await this.getTotalRefundedCents(params.paymentIntentId);
    if (totalRefunded < payment.amountCents) {
      return;
    }

    payment.status = 'refunded';
    payment.updatedByUserId = params.actorUserId ?? payment.updatedByUserId;
    await this.paymentsRepository.save(payment);

    if (booking.status === 'cancelled') {
      await this.bookingEngine.markBookingRefunded(
        params.bookingId,
        params.actorUserId,
        'Remboursement Stripe confirmé (webhook)',
      );
    }
  }

  private async resolvePaymentIntentId(externalId: string | null): Promise<string> {
    if (!externalId?.trim()) {
      throw new BadRequestException('Paiement sans identifiant Stripe (external_id).');
    }
    if (externalId.startsWith('pi_')) {
      return externalId;
    }
    if (externalId.startsWith('cs_')) {
      const stripe = this.getStripe();
      const session = await stripe.checkout.sessions.retrieve(externalId);
      const paymentIntentId =
        typeof session.payment_intent === 'string'
          ? session.payment_intent
          : session.payment_intent?.id;
      if (!paymentIntentId) {
        throw new BadRequestException(
          'Checkout Session Stripe sans PaymentIntent associé.',
        );
      }
      return paymentIntentId;
    }
    throw new BadRequestException(
      `Identifiant Stripe non pris en charge pour remboursement : ${externalId}.`,
    );
  }

  private async getTotalRefundedCents(paymentIntentId: string): Promise<number> {
    const stripe = this.getStripe();
    let total = 0;
    let startingAfter: string | undefined;

    do {
      const page = await stripe.refunds.list({
        payment_intent: paymentIntentId,
        limit: 100,
        ...(startingAfter ? { starting_after: startingAfter } : {}),
      });
      for (const refund of page.data) {
        if (refund.status === 'succeeded') {
          total += refund.amount;
        }
      }
      if (!page.has_more || page.data.length === 0) {
        break;
      }
      startingAfter = page.data[page.data.length - 1]?.id;
    } while (startingAfter);

    return total;
  }
}
