import { formatMoney } from '../../../../email/email.templates';
import type { AccommodationPdfBrandingContext, ScopedPropertyRow } from '../accommodation-reports.types';
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
  truncateText,
} from './pdf-layout.utils';

export type PropertyDossierRoomRow = {
  name: string;
  roomType: string | null;
  maxGuests: number;
  basePriceCents: number;
  currency: string;
};

export type PropertyDossierAmenityRow = {
  code: string;
  name: string;
};

export type RenderPropertyDossierPdfInput = AccommodationPdfBrandingContext & {
  property: ScopedPropertyRow;
  rooms: PropertyDossierRoomRow[];
  amenities: PropertyDossierAmenityRow[];
};

export function renderPropertyDossierPdf(input: RenderPropertyDossierPdfInput): Promise<Buffer> {
  const labels = getAccommodationPdfLabels(input.locale);
  const brandColor = pdfPrimaryColor(input.branding);
  const { doc, finished } = createPdfDocument({
    title: labels.dossier.documentTitle,
    author: input.branding.displayName ?? 'Africa Tourism Gate',
  });

  drawPdfBrandedHeader(doc, {
    title: labels.dossier.documentTitle,
    branding: input.branding,
    logoPath: input.logoPath,
    generatedLabel: labels.generatedOn,
    exportedAt: input.exportedAt,
    locale: input.locale,
    subtitle: input.property.name,
  });

  drawPdfSectionTitle(doc, labels.dossier.infoSection, brandColor);
  drawPdfKeyValue(doc, labels.dossier.name, input.property.name);
  drawPdfKeyValue(doc, labels.dossier.slug, input.property.slug);
  drawPdfKeyValue(
    doc,
    labels.dossier.type,
    accommodationPropertyTypeLabel(input.locale, input.property.propertyType),
  );
  drawPdfKeyValue(doc, labels.dossier.stars, input.property.starRating ?? '—');
  drawPdfKeyValue(doc, labels.dossier.destination, input.property.destinationName || '—');
  drawPdfKeyValue(doc, labels.dossier.address, input.property.addressLine ?? '—');
  drawPdfKeyValue(
    doc,
    labels.dossier.description,
    truncateText(input.property.description, 600),
  );

  drawPdfSectionTitle(doc, labels.dossier.roomsSection, brandColor);
  if (input.rooms.length === 0) {
    doc
      .fillColor('#0f1a16')
      .fontSize(10)
      .font('Helvetica')
      .text(labels.dossier.emptyRooms, 48, doc.y, { width: 499.28 });
  } else {
    drawPdfTable(
      doc,
      [
        { label: labels.dossier.colRoomName, width: 0.3 },
        { label: labels.dossier.colRoomType, width: 0.2 },
        { label: labels.dossier.colMaxGuests, width: 0.15, align: 'center' },
        { label: labels.dossier.colBasePrice, width: 0.35, align: 'right' },
      ],
      input.rooms.map((room) => [
        room.name,
        room.roomType ?? '—',
        String(room.maxGuests),
        formatMoney(room.basePriceCents, room.currency),
      ]),
    );
  }

  drawPdfSectionTitle(doc, labels.dossier.amenitiesSection, brandColor);
  if (input.amenities.length === 0) {
    doc
      .fillColor('#0f1a16')
      .fontSize(10)
      .font('Helvetica')
      .text(labels.dossier.emptyAmenities, 48, doc.y, { width: 499.28 });
  } else {
    drawPdfTable(
      doc,
      [
        { label: labels.dossier.colAmenityCode, width: 0.3 },
        { label: labels.dossier.colAmenityName, width: 0.7 },
      ],
      input.amenities.map((amenity) => [amenity.code, amenity.name]),
    );
  }

  drawPdfFooter(doc, input.branding);
  doc.end();
  return finished;
}
