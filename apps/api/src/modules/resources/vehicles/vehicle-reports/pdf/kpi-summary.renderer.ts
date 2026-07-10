import type { VehiclePdfBrandingContext } from '../vehicle-reports.types';
import { getVehiclePdfLabels } from '../labels/vehicle-pdf.labels';
import {
  createPdfDocument,
  drawPdfBrandedHeader,
  drawPdfFooter,
  drawPdfKeyValue,
  drawPdfSectionTitle,
  drawPdfTable,
  pdfPrimaryColor,
} from '../../../properties/accommodation-reports/pdf/pdf-layout.utils';

export type VehicleKpiSummaryData = {
  vehiclesCount: number;
  agenciesCount: number;
  categoriesCount: number;
  availabilitySlotsCount: number;
  byAgency: Array<{ agencyName: string; count: number }>;
};

export type RenderVehicleKpiSummaryPdfInput = VehiclePdfBrandingContext & {
  data: VehicleKpiSummaryData;
};

export function renderVehicleKpiSummaryPdf(
  input: RenderVehicleKpiSummaryPdfInput,
): Promise<Buffer> {
  const labels = getVehiclePdfLabels(input.locale);
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
  drawPdfKeyValue(doc, labels.kpi.vehicles, String(input.data.vehiclesCount));
  drawPdfKeyValue(doc, labels.kpi.agencies, String(input.data.agenciesCount));
  drawPdfKeyValue(doc, labels.kpi.categories, String(input.data.categoriesCount));
  drawPdfKeyValue(doc, labels.kpi.availabilitySlots, String(input.data.availabilitySlotsCount));

  if (input.data.byAgency.length > 0) {
    drawPdfSectionTitle(doc, labels.kpi.byAgencySection, brandColor);
    drawPdfTable(
      doc,
      [
        { label: labels.kpi.colAgency, width: 0.7 },
        { label: labels.kpi.colCount, width: 0.3, align: 'right' },
      ],
      input.data.byAgency.map((row) => [row.agencyName, String(row.count)]),
    );
  }

  drawPdfFooter(doc, input.branding);
  doc.end();
  return finished;
}
