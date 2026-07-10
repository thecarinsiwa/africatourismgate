import { routeLabel } from '../excel/flight-workbook.builder';
import type { FlightPdfBrandingContext, ScopedFlightRow } from '../flight-reports.types';
import { getFlightPdfLabels } from '../labels/flight-pdf.labels';
import {
  createPdfDocument,
  drawPdfBrandedHeader,
  drawPdfFooter,
  drawPdfSectionTitle,
  drawPdfTable,
  formatPdfDateTime,
  pdfPrimaryColor,
} from '../../../properties/accommodation-reports/pdf/pdf-layout.utils';

export type FlightCatalogPdfRow = {
  flight: ScopedFlightRow;
  classCount: number;
};

export type RenderFlightCatalogPdfInput = FlightPdfBrandingContext & {
  rows: FlightCatalogPdfRow[];
};

export function renderFlightCatalogPdf(input: RenderFlightCatalogPdfInput): Promise<Buffer> {
  const labels = getFlightPdfLabels(input.locale);
  const brandColor = pdfPrimaryColor(input.branding);
  const { doc, finished } = createPdfDocument({
    title: labels.catalog.documentTitle,
    author: input.branding.displayName ?? 'Africa Tourism Gate',
  });

  drawPdfBrandedHeader(doc, {
    title: labels.catalog.documentTitle,
    branding: input.branding,
    logoPath: input.logoPath,
    generatedLabel: labels.generatedOn,
    exportedAt: input.exportedAt,
    locale: input.locale,
  });

  drawPdfSectionTitle(doc, labels.catalog.documentTitle, brandColor);

  if (input.rows.length === 0) {
    doc
      .fillColor('#0f1a16')
      .fontSize(10)
      .font('Helvetica')
      .text(labels.catalog.empty, 48, doc.y, { width: 499.28 });
  } else {
    drawPdfTable(
      doc,
      [
        { label: labels.catalog.colFlight, width: 0.14 },
        { label: labels.catalog.colAirline, width: 0.2 },
        { label: labels.catalog.colRoute, width: 0.34 },
        { label: labels.catalog.colClasses, width: 0.12, align: 'right' },
        { label: labels.catalog.colDeparture, width: 0.2 },
      ],
      input.rows.map((row) => [
        row.flight.flightNumber,
        row.flight.airlineName,
        routeLabel(row.flight),
        String(row.classCount),
        formatPdfDateTime(row.flight.departureTime, input.locale),
      ]),
    );
  }

  drawPdfFooter(doc, input.branding);
  doc.end();
  return finished;
}
