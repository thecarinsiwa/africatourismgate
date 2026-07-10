import type { FlightPdfBrandingContext } from '../flight-reports.types';
import { getFlightPdfLabels } from '../labels/flight-pdf.labels';
import {
  createPdfDocument,
  drawPdfBrandedHeader,
  drawPdfFooter,
  drawPdfKeyValue,
  drawPdfSectionTitle,
  drawPdfTable,
  pdfPrimaryColor,
} from '../../../properties/accommodation-reports/pdf/pdf-layout.utils';

export type FlightKpiSummaryData = {
  flightsCount: number;
  classesCount: number;
  airlinesCount: number;
  airportsCount: number;
  byAirline: Array<{ airlineName: string; count: number }>;
};

export type RenderFlightKpiSummaryPdfInput = FlightPdfBrandingContext & {
  data: FlightKpiSummaryData;
};

export function renderFlightKpiSummaryPdf(
  input: RenderFlightKpiSummaryPdfInput,
): Promise<Buffer> {
  const labels = getFlightPdfLabels(input.locale);
  const brandColor = pdfPrimaryColor(input.branding);
  const { doc, finished } = createPdfDocument({
    title: labels.kpi.documentTitle,
    author: input.branding.displayName ?? 'Africa Tourism Gate',
  });

  drawPdfBrandedHeader(doc, {
    title: labels.kpi.documentTitle,
    branding: input.branding,
    logoPath: input.logoPath,
    generatedLabel: labels.generatedOn,
    exportedAt: input.exportedAt,
    locale: input.locale,
  });

  drawPdfSectionTitle(doc, labels.kpi.summarySection, brandColor);
  drawPdfKeyValue(doc, labels.kpi.flights, String(input.data.flightsCount));
  drawPdfKeyValue(doc, labels.kpi.classes, String(input.data.classesCount));
  drawPdfKeyValue(doc, labels.kpi.airlines, String(input.data.airlinesCount));
  drawPdfKeyValue(doc, labels.kpi.airports, String(input.data.airportsCount));

  if (input.data.byAirline.length > 0) {
    drawPdfSectionTitle(doc, labels.kpi.byAirlineSection, brandColor);
    drawPdfTable(
      doc,
      [
        { label: labels.kpi.colAirline, width: 0.7 },
        { label: labels.kpi.colCount, width: 0.3, align: 'right' },
      ],
      input.data.byAirline.map((row) => [row.airlineName, String(row.count)]),
    );
  }

  drawPdfFooter(doc, input.branding);
  doc.end();
  return finished;
}
