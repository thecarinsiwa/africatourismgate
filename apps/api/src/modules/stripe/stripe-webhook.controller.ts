import {
  BadRequestException,
  Controller,
  Headers,
  HttpCode,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { ApiExcludeController, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '../auth/decorators/public.decorator';
import { StripeService } from './stripe.service';

@ApiTags('stripe')
@ApiExcludeController()
@Controller('stripe')
export class StripeWebhookController {
  private readonly logger = new Logger(StripeWebhookController.name);

  constructor(private readonly stripeService: StripeService) {}

  @Public()
  @Post('webhook')
  @HttpCode(200)
  @ApiOperation({ summary: 'Stripe webhook (raw body)' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string | undefined,
  ): Promise<{ received: true }> {
    if (!signature) {
      throw new BadRequestException('En-tête stripe-signature manquant.');
    }

    const rawBody = req.rawBody;
    if (!rawBody || !Buffer.isBuffer(rawBody)) {
      throw new BadRequestException(
        'Corps brut requis pour la signature Stripe (rawBody).',
      );
    }

    let event;
    try {
      event = this.stripeService.constructWebhookEvent(rawBody, signature);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signature invalide';
      this.logger.warn(`Webhook Stripe rejeté: ${message}`);
      throw new BadRequestException(message);
    }

    await this.stripeService.handleWebhookEvent(event);
    return { received: true };
  }
}
