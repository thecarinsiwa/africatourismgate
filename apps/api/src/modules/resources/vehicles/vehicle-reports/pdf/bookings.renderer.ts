import { formatMoney } from '../../../../email/email.templates';
import { vehicleLabel } from '../labels/vehicle-workbook.labels';
import type { VehiclePdfBrandingContext } from '../vehicle-reports.types';
import {
  bookingRefLabel,
  getVehiclePdfLabels,
} from '../labels/vehicle-pdf.labels';
import {
  createPdfDocument,
  drawPdfBrandedHeader,
  drawPdfFooter,
  drawPdfKeyValue,
  drawPdfSectionTitle,
  drawPdfTable,
  formatPdfDateOnly,
  pdfPrimaryColor,
} from '../../../properties/accommodation-reports/pdf/pdf-layout.utils';

export type VehicleBookingPdfRow = {
  bookingId: string;
  bookingStatus: string;
  licensePlate: string | null;
  vehicleId: string;
  agencyName: string;
  pickupDate: string;
  lineTotalCents: number;
  currency: string;
};

export type RenderVehicleBookingsPdfInput = VehiclePdfBrandingContext & {
  dateFrom: string;
  dateTo: string;
  rows: VehicleBookingPdfRow[];
};

export function renderVehicleBookingsPdf(input: RenderVehicleBookingsPdfInput): Promise<Buffer> {
  const labels = getVehiclePdfLabels(input.locale);
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
        { label: labels.bookings.colVehicle, width: 0.14 },
        { label: labels.bookings.colAgency, width: 0.18 },
        { label: labels.bookings.colReference, width: 0.1 },
        { label: labels.bookings.colStatus, width: 0.14 },
        { label: labels.bookings.colPickupDate, width: 0.18 },
        { label: labels.bookings.colAmount, width: 0.18, align: 'right' },
      ],
      input.rows.map((row) => [
        vehicleLabel(row.licensePlate, row.vehicleId),
        row.agencyName,
        bookingRefLabel(row.bookingId),
        labels.bookings.statusLabels[row.bookingStatus] ?? row.bookingStatus,
        formatPdfDateOnly(row.pickupDate, input.locale),
        formatMoney(row.lineTotalCents, row.currency),
      ]),
    );
  }

  drawPdfFooter(doc, input.branding);
  doc.end();
  return finished;
}
