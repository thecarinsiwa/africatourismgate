import ExcelJS from 'exceljs';
import { buildAccommodationWorkbook } from '../../src/modules/resources/properties/accommodation-reports/excel/accommodation-workbook.builder';
import {
  accommodationWorkbookFilename,
  getAccommodationWorkbookLabels,
} from '../../src/modules/resources/properties/accommodation-reports/labels/accommodation-workbook.labels';

describe('accommodation-workbook', () => {
  it('builds a workbook with four localized sheets', async () => {
    const buffer = await buildAccommodationWorkbook({
      locale: 'fr',
      properties: [
        {
          id: 'prop-1',
          destinationId: 'dest-1',
          name: 'Hotel Atlas',
          slug: 'hotel-atlas',
          propertyType: 'hotel',
          starRating: '4.0',
          description: 'Vue sur la médina',
          addressLine: '12 rue principale',
          destinationName: 'Marrakech',
          createdByUserId: null,
          updatedByUserId: null,
          deletedByUserId: null,
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-01'),
          deletedAt: null,
        },
      ],
      rooms: [
        {
          propertyName: 'Hotel Atlas',
          roomId: 'room-1',
          name: 'Suite',
          roomType: 'suite',
          maxGuests: 2,
          bedConfig: '1 king',
          basePrice: 12000,
          currency: 'EUR',
        },
      ],
      availability: [
        {
          propertyName: 'Hotel Atlas',
          roomName: 'Suite',
          date: '2026-05-01',
          availableUnits: 3,
          price: 15000,
          currency: 'EUR',
        },
      ],
      amenities: [
        {
          propertyName: 'Hotel Atlas',
          code: 'wifi',
          name: 'Wi-Fi',
        },
      ],
    });

    expect(buffer.length).toBeGreaterThan(0);

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
    const labels = getAccommodationWorkbookLabels('fr');

    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      labels.sheets.catalog,
      labels.sheets.rooms,
      labels.sheets.availability,
      labels.sheets.amenities,
    ]);

    const catalogSheet = workbook.getWorksheet(labels.sheets.catalog);
    expect(catalogSheet?.getRow(1).values).toContain(labels.catalog.name);
    expect(catalogSheet?.getRow(2).getCell(2).value).toBe('Hotel Atlas');
  });

  it('formats workbook filename from date range', () => {
    expect(accommodationWorkbookFilename('2026-05-01', '2026-05-31')).toBe(
      'hebergements-2026-05-01_2026-05-31.xlsx',
    );
  });
});
