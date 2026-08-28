import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Organizations } from '../../../entities/generated';
import { DEFAULT_EMAIL_BRANDING } from '../../email/email-branding.constants';
import { resolveLogoForPdf } from '../../email/email-attachments';
import { EmailBrandingService } from '../../email/email-branding.service';
import { renderPosReceiptPdf } from '../../email/pos-receipt-pdf.renderer';
import {
  type PosReceiptContext,
  posReceiptPdfFilename,
} from './pos-receipt.context';
import { PosReceiptEmailService } from './pos-receipt-email.service';

export type PosReceiptPdfFile = {
  buffer: Buffer;
  filename: string;
  contentType: string;
};

@Injectable()
export class PosReceiptPdfService {
  constructor(
    @Inject(forwardRef(() => PosReceiptEmailService))
    private readonly posReceiptEmailService: PosReceiptEmailService,
    private readonly brandingService: EmailBrandingService,
    @InjectRepository(Organizations)
    private readonly organizationsRepository: Repository<Organizations>,
  ) {}

  async generate(
    bookingId: string,
    actorUserId: string,
    organizationId: string,
  ): Promise<PosReceiptPdfFile> {
    const context = await this.posReceiptEmailService.resolveReceiptContext(
      bookingId,
      actorUserId,
      organizationId,
    );
    return this.generateFromContext(context, organizationId);
  }

  async generateFromContext(
    context: PosReceiptContext,
    organizationId: string,
  ): Promise<PosReceiptPdfFile> {
    const branding = await this.resolveBranding(organizationId);
    const logoUrl = await this.resolveOrganizationLogoUrl(
      organizationId,
      branding.logoUrl,
    );
    const logoPath = logoUrl ? await resolveLogoForPdf(logoUrl) : null;

    const buffer = await renderPosReceiptPdf({
      context,
      branding,
      logoPath,
    });

    return {
      buffer,
      filename: posReceiptPdfFilename(context.bookingId),
      contentType: 'application/pdf',
    };
  }

  private async resolveBranding(organizationId: string) {
    try {
      return await this.brandingService.resolveForOrganization(organizationId);
    } catch {
      return DEFAULT_EMAIL_BRANDING;
    }
  }

  private async resolveOrganizationLogoUrl(
    organizationId: string,
    brandingLogoUrl?: string,
  ): Promise<string | undefined> {
    if (brandingLogoUrl?.trim()) {
      return brandingLogoUrl.trim();
    }

    const organization = await this.organizationsRepository.findOne({
      where: { id: organizationId, deletedAt: IsNull() },
    });
    return organization?.logoUrl?.trim() || undefined;
  }
}
