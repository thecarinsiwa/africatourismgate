import { formatMoney } from '../../../../email/email.templates';
import type { AccommodationPdfBrandingContext } from '../accommodation-reports.types';
import {
  bookingRefLabel,
  getAccommodationPdfLabels,
} from '../labels/accommodation-pdf.labels';
import {
  createPdfDocument,
  drawPdfBrandedHeader,
  drawPdfFooter,
  drawPdfKeyValue,
  drawPdfSectionTitle,
  drawPdfTable,
  formatPdfDateOnly,
  pdfPrimaryColor,
} from './pdf-layout.utils';

export type AccommodationBookingPdfRow = {
  bookingId: string;
  bookingStatus: string;
  propertyName: string;
  roomName: string;
  stayFrom: string;
  stayTo: string;
  lineTotalCents: number;
  currency: string;
};

export type RenderBookingsPdfInput = AccommodationPdfBrandingContext & {
  dateFrom: string;
  dateTo: string;
  rows: AccommodationBookingPdfRow[];
};

function formatStayRange(
  stayFrom: string,
  stayTo: string,
  locale: RenderBookingsPdfInput['locale'],
): string {
  const from = formatPdfDateOnly(stayFrom, locale);
  const to = formatPdfDateOnly(stayTo, locale);
  if (from === to) {
    return from;
  }
  return `${from} → ${to}`;
}

export function renderBookingsPdf(input: RenderBookingsPdfInput): Promise<Buffer> {
  const labels = getAccommodationPdfLabels(input.locale);
  const brandColor = pdfPrimaryColor(input.branding);
  const { doc, finished } = createPdfDocument({
    title: labels.bookings.documentTitle,
    author: input.branding.displayName ?? 'Africa Tourism Gate',
  });

  drawPdfBrandedHeader(doc, {
    title: labels.bookings.documentTitle,
    branding: input.branding,
    logoPath: input.logoPath,
    generatedLabel: labels.generatedOn,
    exportedAt: input.exportedAt,
    locale: input.locale,
  });

  drawPdfSectionTitle(doc, labels.bookings.periodSection, brandColor);
  drawPdfKeyValue(doc, labels.bookings.periodFrom, formatPdfDateOnly(input.dateFrom, input.locale));
  drawPdfKeyValue(doc, labels.bookings.periodTo, formatPdfDateOnly(input.dateTo, input.locale));

  drawPdfSectionTitle(doc, labels.bookings.documentTitle, brandColor);

  if (input.rows.length === 0) {
    doc
      .fillColor('#0f1a16')
      .fontSize(10)
      .font('Helvetica')
      .text(labels.bookings.empty, 48, doc.y, { width: 499.28 });
  } else {
    drawPdfTable(
      doc,
      [
        { label: labels.bookings.colProperty, width: 0.2 },
        { label: labels.bookings.colRoom, width: 0.16 },
        { label: labels.bookings.colReference, width: 0.1 },
        { label: labels.bookings.colStatus, width: 0.14 },
        { label: labels.bookings.colStay, width: 0.22 },
        { label: labels.bookings.colAmount, width: 0.18, align: 'right' },
      ],
      input.rows.map((row) => [
        row.propertyName,
        row.roomName,
        bookingRefLabel(row.bookingId),
        labels.bookings.statusLabels[row.bookingStatus] ?? row.bookingStatus,
        formatStayRange(row.stayFrom, row.stayTo, input.locale),
        formatMoney(row.lineTotalCents, row.currency),
      ]),
    );
  }

  drawPdfFooter(doc, input.branding);
  doc.end();
  return finished;
}
