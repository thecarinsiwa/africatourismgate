import { formatMoney } from '../../../../email/email.templates';
import type { FlightPdfBrandingContext, ScopedFlightRow } from '../flight-reports.types';
import {
  flightClassPdfLabel,
  getFlightPdfLabels,
} from '../labels/flight-pdf.labels';
import {
  createPdfDocument,
  drawPdfBrandedHeader,
  drawPdfFooter,
  drawPdfKeyValue,
  drawPdfSectionTitle,
  drawPdfTable,
  formatPdfDateTime,
  pdfPrimaryColor,
} from '../../../properties/accommodation-reports/pdf/pdf-layout.utils';

export type FlightDossierClassRow = {
  className: string;
  seatsTotal: number;
  basePriceCents: number;
};

export type RenderFlightDossierPdfInput = FlightPdfBrandingContext & {
  flight: ScopedFlightRow;
  classes: FlightDossierClassRow[];
};

function formatDurationMinutes(minutes: number, locale: string): string {
  if (!Number.isFinite(minutes) || minutes < 1) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  const lang = locale.slice(0, 2).toLowerCase();

  if (lang === 'en') {
    if (hours === 0) return `${mins} min`;
    if (mins === 0) return `${hours} hr`;
    return `${hours} hr ${mins} min`;
  }

  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins}`;
}

function formatAirport(
  iata: string,
  city: string,
): string {
  if (!iata && !city) return '—';
  if (!city) return iata;
  if (!iata) return city;
  return `${iata} — ${city}`;
}

export function renderFlightDossierPdf(input: RenderFlightDossierPdfInput): Promise<Buffer> {
  const labels = getFlightPdfLabels(input.locale);
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
    subtitle: input.flight.flightNumber,
  });

  drawPdfSectionTitle(doc, labels.dossier.infoSection, brandColor);
  drawPdfKeyValue(doc, labels.dossier.flightNumber, input.flight.flightNumber);
  drawPdfKeyValue(
    doc,
    labels.dossier.airline,
    input.flight.airlineIata
      ? `${input.flight.airlineIata} — ${input.flight.airlineName || '—'}`
      : input.flight.airlineName || '—',
  );
  drawPdfKeyValue(
    doc,
    labels.dossier.departure,
    formatAirport(input.flight.departureAirportIata, input.flight.departureAirportCity),
  );
  drawPdfKeyValue(
    doc,
    labels.dossier.arrival,
    formatAirport(input.flight.arrivalAirportIata, input.flight.arrivalAirportCity),
  );
  drawPdfKeyValue(
    doc,
    labels.dossier.departureTime,
    formatPdfDateTime(input.flight.departureTime, input.locale),
  );
  drawPdfKeyValue(
    doc,
    labels.dossier.arrivalTime,
    formatPdfDateTime(input.flight.arrivalTime, input.locale),
  );
  drawPdfKeyValue(
    doc,
    labels.dossier.duration,
    formatDurationMinutes(input.flight.durationMinutes, input.locale),
  );

  drawPdfSectionTitle(doc, labels.dossier.classesSection, brandColor);
  if (input.classes.length === 0) {
    doc
      .fillColor('#0f1a16')
      .fontSize(10)
      .font('Helvetica')
      .text(labels.dossier.emptyClasses, 48, doc.y, { width: 499.28 });
  } else {
    drawPdfTable(
      doc,
      [
        { label: labels.dossier.colCabin, width: 0.4 },
        { label: labels.dossier.colSeats, width: 0.2, align: 'center' },
        { label: labels.dossier.colBasePrice, width: 0.4, align: 'right' },
      ],
      input.classes.map((cabin) => [
        flightClassPdfLabel(input.locale, cabin.className),
        String(cabin.seatsTotal),
        formatMoney(cabin.basePriceCents, 'USD'),
      ]),
    );
  }

  drawPdfFooter(doc, input.branding);
  doc.end();
  return finished;
}
