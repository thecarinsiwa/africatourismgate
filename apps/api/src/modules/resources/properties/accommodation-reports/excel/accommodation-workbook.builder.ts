import ExcelJS from 'exceljs';
import type { ScopedPropertyRow } from '../accommodation-reports.types';
import {
  getAccommodationWorkbookLabels,
  type AccommodationWorkbookLabels,
} from '../labels/accommodation-workbook.labels';
import type { AccommodationReportLocale } from '../labels/accommodation-reports.labels';

export type AccommodationWorkbookRoomRow = {
  propertyName: string;
  roomId: string;
  name: string;
  roomType: string | null;
  maxGuests: number;
  bedConfig: string | null;
  basePrice: number;
  currency: string;
};

export type AccommodationWorkbookAvailabilityRow = {
  propertyName: string;
  roomName: string;
  date: string;
  availableUnits: number;
  price: number;
  currency: string;
};

export type AccommodationWorkbookAmenityRow = {
  propertyName: string;
  code: string;
  name: string;
};

export type AccommodationWorkbookInput = {
  locale: AccommodationReportLocale;
  properties: ScopedPropertyRow[];
  rooms: AccommodationWorkbookRoomRow[];
  availability: AccommodationWorkbookAvailabilityRow[];
  amenities: AccommodationWorkbookAmenityRow[];
};

function formatMoneyMajor(cents: number): number {
  return Math.round(cents) / 100;
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

function propertyTypeLabel(
  labels: AccommodationWorkbookLabels,
  propertyType: string,
): string {
  return labels.propertyTypes[propertyType] ?? propertyType;
}

function buildCatalogRows(
  labels: AccommodationWorkbookLabels,
  properties: ScopedPropertyRow[],
): Array<Array<string | number | null>> {
  return properties.map((property) => [
    property.id,
    property.name,
    property.slug,
    propertyTypeLabel(labels, property.propertyType),
    property.starRating ?? '',
    property.destinationName,
    property.addressLine ?? '',
    property.description ?? '',
  ]);
}

function buildRoomRows(rooms: AccommodationWorkbookRoomRow[]): Array<Array<string | number | null>> {
  return rooms.map((room) => [
    room.propertyName,
    room.roomId,
    room.name,
    room.roomType ?? '',
    room.maxGuests,
    room.bedConfig ?? '',
    formatMoneyMajor(room.basePrice),
    room.currency,
  ]);
}

function buildAvailabilityRows(
  availability: AccommodationWorkbookAvailabilityRow[],
): Array<Array<string | number | null>> {
  return availability.map((row) => [
    row.propertyName,
    row.roomName,
    row.date,
    row.availableUnits,
    formatMoneyMajor(row.price),
    row.currency,
  ]);
}

function buildAmenityRows(
  amenities: AccommodationWorkbookAmenityRow[],
): Array<Array<string | number | null>> {
  return amenities.map((row) => [row.propertyName, row.code, row.name]);
}

export async function buildAccommodationWorkbook(
  input: AccommodationWorkbookInput,
): Promise<Buffer> {
  const labels = getAccommodationWorkbookLabels(input.locale);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Africa Tourism Gate';
  workbook.created = new Date();

  addSheet(
    workbook,
    labels.sheets.catalog,
    [
      labels.catalog.id,
      labels.catalog.name,
      labels.catalog.slug,
      labels.catalog.type,
      labels.catalog.stars,
      labels.catalog.destination,
      labels.catalog.address,
      labels.catalog.description,
    ],
    buildCatalogRows(labels, input.properties),
  );

  addSheet(
    workbook,
    labels.sheets.rooms,
    [
      labels.rooms.property,
      labels.rooms.roomId,
      labels.rooms.name,
      labels.rooms.roomType,
      labels.rooms.maxGuests,
      labels.rooms.bedConfig,
      labels.rooms.basePrice,
      labels.rooms.currency,
    ],
    buildRoomRows(input.rooms),
  );

  addSheet(
    workbook,
    labels.sheets.availability,
    [
      labels.availability.property,
      labels.availability.room,
      labels.availability.date,
      labels.availability.availableUnits,
      labels.availability.price,
      labels.availability.currency,
    ],
    buildAvailabilityRows(input.availability),
  );

  addSheet(
    workbook,
    labels.sheets.amenities,
    [labels.amenities.property, labels.amenities.code, labels.amenities.name],
    buildAmenityRows(input.amenities),
  );

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
