import { DEFAULT_EMAIL_BRANDING } from '../../src/modules/email/email-branding.constants';
import { renderBookingsPdf } from '../../src/modules/resources/properties/accommodation-reports/pdf/bookings.renderer';
import { renderCatalogPdf } from '../../src/modules/resources/properties/accommodation-reports/pdf/catalog.renderer';
import { renderKpiSummaryPdf } from '../../src/modules/resources/properties/accommodation-reports/pdf/kpi-summary.renderer';
import { renderPropertyDossierPdf } from '../../src/modules/resources/properties/accommodation-reports/pdf/property-dossier.renderer';

const exportedAt = new Date('2026-07-10T10:00:00.000Z');
const baseContext = {
  locale: 'fr' as const,
  branding: DEFAULT_EMAIL_BRANDING,
  logoPath: null,
  exportedAt,
};

describe('accommodation-pdf', () => {
  it('renders KPI summary PDF', async () => {
    const buffer = await renderKpiSummaryPdf({
      ...baseContext,
      data: {
        propertiesCount: 3,
        roomsCount: 12,
        amenitiesCount: 8,
        destinationsCount: 2,
        byPropertyType: [
          { propertyType: 'hotel', count: 2 },
          { propertyType: 'villa', count: 1 },
        ],
      },
    });
    expect(buffer.length).toBeGreaterThan(500);
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('renders catalog PDF', async () => {
    const buffer = await renderCatalogPdf({
      ...baseContext,
      rows: [
        {
          name: 'Hotel Atlas',
          propertyType: 'hotel',
          destinationName: 'Marrakech',
          starRating: '4.0',
          roomCount: 5,
        },
      ],
    });
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('renders bookings PDF', async () => {
    const buffer = await renderBookingsPdf({
      ...baseContext,
      dateFrom: '2026-05-01',
      dateTo: '2026-05-31',
      rows: [
        {
          bookingId: '00000000-0000-4000-8000-000000009999',
          bookingStatus: 'confirmed',
          propertyName: 'Hotel Atlas',
          roomName: 'Suite',
          stayFrom: '2026-05-10',
          stayTo: '2026-05-12',
          lineTotalCents: 45000,
          currency: 'EUR',
        },
      ],
    });
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('renders property dossier PDF', async () => {
    const buffer = await renderPropertyDossierPdf({
      ...baseContext,
      property: {
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
        createdAt: exportedAt,
        updatedAt: exportedAt,
        deletedAt: null,
      },
      rooms: [
        {
          name: 'Suite',
          roomType: 'suite',
          maxGuests: 2,
          basePriceCents: 12000,
          currency: 'EUR',
        },
      ],
      amenities: [{ code: 'wifi', name: 'Wi-Fi' }],
    });
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });
});
