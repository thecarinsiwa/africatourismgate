import { Body, Controller, Post } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { OrgScopeService } from '../../common/org-scope/org-scope.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../auth/dto/auth-user.dto';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { EmailBrandingService } from './email-branding.service';
import {
  EmailPreviewDto,
  EmailPreviewResponseDto,
} from './dto/email-preview.dto';
import {
  renderBookingConfirmationEmail,
  renderPasswordResetEmail,
  renderWelcomeEmail,
  webBase,
} from './email.templates';
import {
  renderBookingApprovedChatEmail,
  renderBookingPaymentInviteEmail,
  renderBookingRejectedEmail,
  renderBookingRequestReceivedEmail,
} from './assisted-booking.email.templates';
import { renderPosReceiptEmail } from './pos-receipt.email.templates';

const PREVIEW_BOOKING_ID = '00000000-0000-4000-8000-000000009999';

@ApiTags('email')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('email')
export class EmailController {
  constructor(
    private readonly brandingService: EmailBrandingService,
    private readonly orgScopeService: OrgScopeService,
  ) {}

  @Post('preview')
  @RequirePermissions('organization_settings.read')
  @ApiOperation({
    summary: 'Preview transactional email HTML (no SMTP send)',
  })
  @ApiOkResponse({ type: EmailPreviewResponseDto })
  async preview(
    @Body() dto: EmailPreviewDto,
    @CurrentUser() user: AuthUserDto,
  ): Promise<EmailPreviewResponseDto> {
    const organizationId = await this.orgScopeService.resolveOrganizationId(
      user,
      dto.organizationId,
    );
    const resolved =
      await this.brandingService.resolveForOrganization(organizationId);
    const branding = this.brandingService.mergeWithOverride(
      resolved,
      dto.branding,
    );

    const previewWebUrl = process.env.NEXT_PUBLIC_WEB_URL;
    const assistedSample = {
      to: 'marie@example.com',
      firstName: 'Marie',
      bookingId: PREVIEW_BOOKING_ID,
      totalCents: 125_000,
      currency: 'USD',
      itemTitles: ['Safari 3 jours — Parc national', 'Transfert aéroport'],
      webUrl: previewWebUrl,
    };

    switch (dto.template) {
      case 'welcome':
        return renderWelcomeEmail(
          {
            to: 'marie@example.com',
            firstName: 'Marie',
            webUrl: process.env.NEXT_PUBLIC_WEB_URL,
          },
          branding,
        );
      case 'booking':
        return renderBookingConfirmationEmail(
          {
            to: 'marie@example.com',
            firstName: 'Marie',
            bookingId: PREVIEW_BOOKING_ID,
            totalCents: 125_000,
            currency: 'USD',
            itemTitles: ['Safari 3 jours', 'Transfert aéroport'],
            confirmedAt: new Date().toISOString(),
            webUrl: previewWebUrl,
          },
          branding,
        );
      case 'booking_receipt':
        return renderPosReceiptEmail(
          {
            to: 'marie@example.com',
            firstName: 'Marie',
            bookingId: PREVIEW_BOOKING_ID,
            issuedAt: new Date().toISOString(),
            organizationName: branding.displayName,
            employeeName: 'Jean Caissier',
            clientName: 'Marie Dupont',
            paymentMethodLabel: 'Espèces',
            items: [
              {
                title: 'Safari 3 jours — Parc national',
                quantity: 2,
                unitPriceCents: 45_000,
                lineTotalCents: 90_000,
              },
              {
                title: 'Transfert aéroport',
                quantity: 1,
                unitPriceCents: 35_000,
                lineTotalCents: 35_000,
              },
            ],
            subtotalCents: 125_000,
            discountCents: 0,
            totalCents: 125_000,
            currency: 'USD',
            webUrl: previewWebUrl,
          },
          branding,
        );
      case 'password_reset':
        return renderPasswordResetEmail(
          {
            to: 'marie@example.com',
            firstName: 'Marie',
            resetUrl: 'https://app.example.com/reset?token=preview',
          },
          branding,
        );
      case 'booking_request_received':
        return renderBookingRequestReceivedEmail(assistedSample, branding);
      case 'booking_approved_chat':
        return renderBookingApprovedChatEmail(
          {
            ...assistedSample,
            chatUrl: `${webBase(previewWebUrl)}/account/reservations/${PREVIEW_BOOKING_ID}/chat`,
          },
          branding,
        );
      case 'booking_rejected':
        return renderBookingRejectedEmail(
          {
            ...assistedSample,
            reason: 'Dates indisponibles pour la période demandée.',
          },
          branding,
        );
      case 'booking_payment_invite':
        return renderBookingPaymentInviteEmail(
          {
            ...assistedSample,
            paymentUrl: 'https://checkout.stripe.com/c/pay/cs_test_preview',
          },
          branding,
        );
    }
  }
}
