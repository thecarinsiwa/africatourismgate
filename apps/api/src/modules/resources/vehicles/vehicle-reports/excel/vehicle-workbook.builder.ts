import ExcelJS from 'exceljs';
import type { ScopedVehicleRow } from '../vehicle-reports.types';
import {
  getVehicleWorkbookLabels,
  vehicleLabel,
  vehicleStatusLabel,
  type VehicleWorkbookLabels,
} from '../labels/vehicle-workbook.labels';
import type { VehicleReportLocale } from '../labels/vehicle-reports.labels';

export type VehicleWorkbookCategoryRow = {
  categoryName: string;
  exampleModel: string;
  vehicleCount: number;
  avgDailyPriceCents: number;
};

export type VehicleWorkbookAvailabilityRow = {
  licensePlate: string | null;
  vehicleId: string;
  agencyName: string;
  categoryName: string;
  startDatetime: string;
  endDatetime: string;
  status: string;
};

export type VehicleWorkbookInput = {
  locale: VehicleReportLocale;
  vehicles: ScopedVehicleRow[];
  categories: VehicleWorkbookCategoryRow[];
  availability: VehicleWorkbookAvailabilityRow[];
};

function formatMoneyMajor(cents: number): number {
  return Math.round(cents) / 100;
}

function formatDateTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return date.toISOString().replace('T', ' ').slice(0, 19);
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

function buildCatalogRows(
  vehicles: ScopedVehicleRow[],
): Array<Array<string | number | null>> {
  return vehicles.map((vehicle) => [
    vehicle.id,
    vehicle.licensePlate ?? '',
    vehicle.agencyName,
    vehicle.categoryName,
    formatMoneyMajor(vehicle.dailyPriceCents),
    vehicle.currency,
  ]);
}

function buildCategoryRows(
  categories: VehicleWorkbookCategoryRow[],
): Array<Array<string | number | null>> {
  return categories.map((row) => [
    row.categoryName,
    row.exampleModel,
    row.vehicleCount,
    formatMoneyMajor(row.avgDailyPriceCents),
  ]);
}

function buildAvailabilityRows(
  labels: VehicleWorkbookLabels,
  availability: VehicleWorkbookAvailabilityRow[],
): Array<Array<string | number | null>> {
  return availability.map((row) => [
    vehicleLabel(row.licensePlate, row.vehicleId),
    row.agencyName,
    row.categoryName,
    formatDateTime(row.startDatetime),
    formatDateTime(row.endDatetime),
    vehicleStatusLabel(labels, row.status),
  ]);
}

export async function buildVehicleWorkbook(input: VehicleWorkbookInput): Promise<Buffer> {
  const labels = getVehicleWorkbookLabels(input.locale);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Africa Tourism Gate';
  workbook.created = new Date();

  addSheet(
    workbook,
    labels.sheets.catalog,
    [
      labels.catalog.id,
      labels.catalog.licensePlate,
      labels.catalog.agency,
      labels.catalog.category,
      labels.catalog.dailyPrice,
      labels.catalog.currency,
    ],
    buildCatalogRows(input.vehicles),
  );

  addSheet(
    workbook,
    labels.sheets.categories,
    [
      labels.categories.category,
      labels.categories.exampleModel,
      labels.categories.vehicleCount,
      labels.categories.avgDailyPrice,
    ],
    buildCategoryRows(input.categories),
  );

  addSheet(
    workbook,
    labels.sheets.availability,
    [
      labels.availability.licensePlate,
      labels.availability.agency,
      labels.availability.category,
      labels.availability.start,
      labels.availability.end,
      labels.availability.status,
    ],
    buildAvailabilityRows(labels, input.availability),
  );

  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
