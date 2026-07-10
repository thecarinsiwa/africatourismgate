import type { AccommodationPdfBrandingContext } from '../accommodation-reports.types';
import {
  accommodationPropertyTypeLabel,
  getAccommodationPdfLabels,
} from '../labels/accommodation-pdf.labels';
import {
  createPdfDocument,
  drawPdfBrandedHeader,
  drawPdfFooter,
  drawPdfSectionTitle,
  drawPdfTable,
  pdfPrimaryColor,
} from './pdf-layout.utils';

export type AccommodationCatalogPdfRow = {
  name: string;
  propertyType: string;
  destinationName: string;
  starRating: string | null;
  roomCount: number;
};

export type RenderCatalogPdfInput = AccommodationPdfBrandingContext & {
  rows: AccommodationCatalogPdfRow[];
};

export function renderCatalogPdf(input: RenderCatalogPdfInput): Promise<Buffer> {
  const labels = getAccommodationPdfLabels(input.locale);
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
        { label: labels.catalog.colName, width: 0.28 },
        { label: labels.catalog.colType, width: 0.16 },
        { label: labels.catalog.colDestination, width: 0.24 },
        { label: labels.catalog.colStars, width: 0.12, align: 'center' },
        { label: labels.catalog.colRooms, width: 0.2, align: 'right' },
      ],
      input.rows.map((row) => [
        row.name,
        accommodationPropertyTypeLabel(input.locale, row.propertyType),
        row.destinationName || '—',
        row.starRating ?? '—',
        String(row.roomCount),
      ]),
    );
  }

  drawPdfFooter(doc, input.branding);
  doc.end();
  return finished;
}
