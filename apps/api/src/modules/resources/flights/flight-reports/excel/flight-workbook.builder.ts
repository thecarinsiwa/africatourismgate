import ExcelJS from 'exceljs';
import type { ScopedFlightRow } from '../flight-reports.types';
import {
  flightClassLabel,
  getFlightWorkbookLabels,
  type FlightWorkbookLabels,
} from '../labels/flight-workbook.labels';
import type { FlightReportLocale } from '../labels/flight-reports.labels';

export type FlightWorkbookClassRow = {
  flightNumber: string;
  className: string;
  seatsTotal: number;
  basePriceCents: number;
};

export type FlightWorkbookAvailabilityRow = {
  flightNumber: string;
  className: string;
  date: string;
  availableSeats: number;
  priceCents: number;
};

export type FlightWorkbookInput = {
  locale: FlightReportLocale;
  flights: ScopedFlightRow[];
  classes: FlightWorkbookClassRow[];
  availability: FlightWorkbookAvailabilityRow[];
};

function formatMoneyMajor(cents: number): number {
  return Math.round(cents) / 100;
}

function formatDateTime(value: Date): string {
  return value.toISOString().replace('T', ' ').slice(0, 19);
}

function styleHeaderRow(row: ExcelJS.Row): void {
  row.font = { bold: true };
  row.alignment = { vertical: 'middle', wrapText: true };
}

function autoFitColumns(sheet: ExcelJS.Worksheet, minWidth = 10, maxWidth = 48): void {
  sheet.columns.forEach((column) => {
    if (!column || typeof column.eachCell !== 'function') {
      return;
    }

    let longest = minWidth;
    column.eachCell({ includeEmpty: true }, (cell) => {
      const value = cell.value;
      const text =
        value === null || value === undefined
          ? ''
          : typeof value === 'object' && 'text' in value
            ? String(value.text)
            : String(value);
      longest = Math.max(longest, Math.min(text.length + 2, maxWidth));
    });
    column.width = longest;
  });
}

function addSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  headers: string[],
  rows: Array<Array<string | number | null>>,
): ExcelJS.Worksheet {
  const sheet = workbook.addWorksheet(name, {
    views: [{ state: 'frozen', ySplit: 1 }],
  });
  const headerRow = sheet.addRow(headers);
  styleHeaderRow(headerRow);

  for (const row of rows) {
    sheet.addRow(row);
  }

  autoFitColumns(sheet);
  return sheet;
}

function routeLabel(flight: ScopedFlightRow): string {
  return `${flight.departureAirportIata} ${flight.departureAirportCity} → ${flight.arrivalAirportIata} ${flight.arrivalAirportCity}`;
}

function buildCatalogRows(
  flights: ScopedFlightRow[],
): Array<Array<string | number | null>> {
  return flights.map((flight) => [
    flight.id,
    flight.flightNumber,
    flight.airlineName,
    flight.airlineIata,
    `${flight.departureAirportIata} — ${flight.departureAirportCity}`,
    `${flight.arrivalAirportIata} — ${flight.arrivalAirportCity}`,
    formatDateTime(flight.departureTime),
    formatDateTime(flight.arrivalTime),
    flight.durationMinutes,
  ]);
}

function buildClassRows(
  labels: FlightWorkbookLabels,
  classes: FlightWorkbookClassRow[],
): Array<Array<string | number | null>> {
  return classes.map((row) => [
    row.flightNumber,
    flightClassLabel(labels, row.className),
    row.seatsTotal,
    formatMoneyMajor(row.basePriceCents),
  ]);
}

function buildAvailabilityRows(
  labels: FlightWorkbookLabels,
  availability: FlightWorkbookAvailabilityRow[],
): Array<Array<string | number | null>> {
  return availability.map((row) => [
    row.flightNumber,
    flightClassLabel(labels, row.className),
    row.date,
    row.availableSeats,
    formatMoneyMajor(row.priceCents),
  ]);
}

export async function buildFlightWorkbook(input: FlightWorkbookInput): Promise<Buffer> {
  const labels = getFlightWorkbookLabels(input.locale);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Africa Tourism Gate';
  workbook.created = new Date();

  addSheet(
    workbook,
    labels.sheets.catalog,
    [
      labels.catalog.id,
      labels.catalog.flightNumber,
      labels.catalog.airline,
      labels.catalog.airlineIata,
      labels.catalog.departure,
      labels.catalog.arrival,
      labels.catalog.departureTime,
      labels.catalog.arrivalTime,
      labels.catalog.durationMinutes,
    ],
    buildCatalogRows(input.flights),
  );

  addSheet(
    workbook,
    labels.sheets.classes,
    [
      labels.classes.flightNumber,
      labels.classes.className,
      labels.classes.seatsTotal,
      labels.classes.basePrice,
    ],
    buildClassRows(labels, input.classes),
  );

  addSheet(
    workbook,
    labels.sheets.availability,
    [
      labels.availability.flightNumber,
      labels.availability.className,
      labels.availability.date,
      labels.availability.availableSeats,
      labels.availability.price,
    ],
    buildAvailabilityRows(labels, input.availability),
  );

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}

export { routeLabel };
