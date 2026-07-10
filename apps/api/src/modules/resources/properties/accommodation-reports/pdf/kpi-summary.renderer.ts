import type { AccommodationPdfBrandingContext } from '../accommodation-reports.types';
import {
  accommodationPropertyTypeLabel,
  getAccommodationPdfLabels,
} from '../labels/accommodation-pdf.labels';
import {
  createPdfDocument,
  drawPdfBrandedHeader,
  drawPdfFooter,
  drawPdfKeyValue,
  drawPdfSectionTitle,
  drawPdfTable,
  pdfPrimaryColor,
} from './pdf-layout.utils';

export type AccommodationKpiSummaryData = {
  propertiesCount: number;
  roomsCount: number;
  amenitiesCount: number;
  destinationsCount: number;
  byPropertyType: Array<{ propertyType: string; count: number }>;
};

export type RenderKpiSummaryPdfInput = AccommodationPdfBrandingContext & {
  data: AccommodationKpiSummaryData;
};

export function renderKpiSummaryPdf(input: RenderKpiSummaryPdfInput): Promise<Buffer> {
  const labels = getAccommodationPdfLabels(input.locale);
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
  drawPdfKeyValue(doc, labels.kpi.properties, String(input.data.propertiesCount));
  drawPdfKeyValue(doc, labels.kpi.rooms, String(input.data.roomsCount));
  drawPdfKeyValue(doc, labels.kpi.amenities, String(input.data.amenitiesCount));
  drawPdfKeyValue(doc, labels.kpi.destinations, String(input.data.destinationsCount));

  if (input.data.byPropertyType.length > 0) {
    drawPdfSectionTitle(doc, labels.kpi.byTypeSection, brandColor);
    drawPdfTable(
      doc,
      [
        { label: labels.kpi.colType, width: 0.7 },
        { label: labels.kpi.colCount, width: 0.3, align: 'right' },
      ],
      input.data.byPropertyType.map((row) => [
        accommodationPropertyTypeLabel(input.locale, row.propertyType),
        String(row.count),
      ]),
    );
  }

  drawPdfFooter(doc, input.branding);
  doc.end();
  return finished;
}
