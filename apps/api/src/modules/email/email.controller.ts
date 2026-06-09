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
} from './email.templates';

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

    switch (dto.template) {
      case 'welcome':
        return renderWelcomeEmail(
          { to: 'marie@example.com', firstName: 'Marie' },
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
            webUrl: process.env.NEXT_PUBLIC_WEB_URL,
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
    }
  }
}
