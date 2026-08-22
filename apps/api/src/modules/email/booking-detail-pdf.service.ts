import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { Organizations } from '../../entities/generated';
import type { BookingManifestEntryDto } from '../resources/bookings/dto/booking-manifest-entry.dto';
import type { BookingDetailDto } from '../resources/bookings/dto/booking-detail.dto';
import { EmailBrandingService } from './email-branding.service';
import { resolveLogoForPdf } from './email-attachments';
import { PLATFORM_ORG_ID } from '../../common/org-scope/org-scope.service';
import { DEFAULT_EMAIL_BRANDING } from './email-branding.constants';
import { bookingDetailPdfFilename, resolvePdfLocale } from './booking-detail-pdf.labels';
import { BookingDetailPdfEnrichmentService } from './booking-detail-pdf-enrichment.service';
import { renderBookingDetailPdf } from './booking-detail-pdf.renderer';
import { webBase } from './email.templates';

type GeneratePdfParams = {
  detail: BookingDetailDto;
  manifest: BookingManifestEntryDto[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    preferredLanguage?: string | null;
    organizationId?: string | null;
  };
  webUrl?: string;
  organizationId?: string;
};

function toDateOnlyString(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value.trim());
  return match ? match[1]! : value.slice(0, 10);
}

function deriveVisitDates(
  items: BookingDetailDto['items'],
): { startDate: string | null; endDate: string | null } {
  const dated = items.filter((item) => item.startDate);
  if (dated.length === 0) {
    return { startDate: null, endDate: null };
  }
  const starts = dated
    .map((item) => toDateOnlyString(item.startDate))
    .filter((value): value is string => Boolean(value))
    .sort();
  const ends = dated
    .map((item) => toDateOnlyString(item.endDate ?? item.startDate))
    .filter((value): value is string => Boolean(value))
    .sort();
  return {
    startDate: starts[0] ?? null,
    endDate: ends[ends.length - 1] ?? null,
  };
}

@Injectable()
export class BookingDetailPdfService {
  constructor(
    private readonly brandingService: EmailBrandingService,
    private readonly pdfEnrichment: BookingDetailPdfEnrichmentService,
    @InjectRepository(Organizations)
    private readonly organizationsRepository: Repository<Organizations>,
  ) {}

  async generate(params: GeneratePdfParams): Promise<{ buffer: Buffer; filename: string }> {
    const { detail, manifest, customer, webUrl } = params;
    const locale = resolvePdfLocale(customer.preferredLanguage);
    const organizationId =
      params.organizationId ?? customer.organizationId ?? PLATFORM_ORG_ID;
    const branding = await this.resolveBranding(organizationId);
    const logoUrl = await this.resolveOrganizationLogoUrl(organizationId, branding.logoUrl);
    const logoPath = await resolveLogoForPdf(logoUrl);
    const visitDates = deriveVisitDates(detail.items);
    const baseUrl = webBase(webUrl);
    const bookingId = detail.booking.id;
    const enriched = await this.pdfEnrichment.enrich(bookingId, detail, manifest, locale);

    const buffer = await renderBookingDetailPdf({
      bookingId,
      status: detail.booking.status,
      totalCents: detail.totalCents,
      currency: detail.currency,
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
      },
      items: detail.items.map((item) => ({
        title: item.titleSnapshot,
        itemType: item.itemType,
        quantity: item.quantity,
        unitPriceCents: item.unitPriceCents,
        startDate: toDateOnlyString(item.startDate),
        endDate: toDateOnlyString(item.endDate),
      })),
      travelers: manifest.map((entry) => ({
        fullName: entry.fullName,
        age: entry.age,
        sex: entry.sex,
        nationality: entry.nationality,
        idNumber: entry.idNumber,
        priceCents: entry.priceCents,
        conditions: entry.conditions,
        comment: entry.comment,
        other: entry.other,
      })),
      itinerary: enriched.itinerary,
      guides: enriched.guides,
      payments: enriched.payments,
      bookingCreatedAt: enriched.bookingCreatedAt,
      visitStartDate: visitDates.startDate,
      visitEndDate: visitDates.endDate,
      chatUrl: `${baseUrl}/account/reservations/${bookingId}/chat`,
      accountUrl: `${baseUrl}/account/reservations/${bookingId}`,
      locale,
      branding,
      logoPath,
      generatedAt: new Date().toISOString(),
    });

    return {
      buffer,
      filename: bookingDetailPdfFilename(bookingId),
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
    const orgLogo = organization?.logoUrl?.trim();
    return orgLogo || undefined;
  }
}
