import { formatMoney } from '../../../../email/email.templates';
import { vehicleLabel } from '../labels/vehicle-workbook.labels';
import type { VehiclePdfBrandingContext, ScopedVehicleRow } from '../vehicle-reports.types';
import { getVehiclePdfLabels } from '../labels/vehicle-pdf.labels';
import {
  createPdfDocument,
  drawPdfBrandedHeader,
  drawPdfFooter,
  drawPdfSectionTitle,
  drawPdfTable,
  pdfPrimaryColor,
} from '../../../properties/accommodation-reports/pdf/pdf-layout.utils';

export type RenderVehicleCatalogPdfInput = VehiclePdfBrandingContext & {
  vehicles: ScopedVehicleRow[];
};

export function renderVehicleCatalogPdf(input: RenderVehicleCatalogPdfInput): Promise<Buffer> {
  const labels = getVehiclePdfLabels(input.locale);
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

  if (input.vehicles.length === 0) {
    doc
      .fillColor('#0f1a16')
      .fontSize(10)
      .font('Helvetica')
      .text(labels.catalog.empty, 48, doc.y, { width: 499.28 });
  } else {
    drawPdfTable(
      doc,
      [
        { label: labels.catalog.colVehicle, width: 0.18 },
        { label: labels.catalog.colAgency, width: 0.28 },
        { label: labels.catalog.colCategory, width: 0.28 },
        { label: labels.catalog.colDailyPrice, width: 0.26, align: 'right' },
      ],
      input.vehicles.map((vehicle) => [
        vehicleLabel(vehicle.licensePlate, vehicle.id),
        vehicle.agencyName,
        vehicle.categoryName,
        formatMoney(vehicle.dailyPriceCents, vehicle.currency),
      ]),
    );
  }

  drawPdfFooter(doc, input.branding);
  doc.end();
  return finished;
}
