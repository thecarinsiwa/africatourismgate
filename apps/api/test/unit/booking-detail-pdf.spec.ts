import { DEFAULT_EMAIL_BRANDING } from '../../src/modules/email/email-branding.constants';
import { getBookingDetailPdfLabels } from '../../src/modules/email/booking-detail-pdf.labels';
import {
  bookingRefForPdf,
  renderBookingDetailPdf,
} from '../../src/modules/email/booking-detail-pdf.renderer';

const BOOKING_ID = '00000000-0000-4000-8000-000000009999';

function sampleInput(locale: 'fr' | 'en' | 'es' = 'fr') {
  return {
    bookingId: BOOKING_ID,
    status: 'pending_payment',
    totalCents: 92250,
    currency: 'USD',
    customer: {
      firstName: 'Marie',
      lastName: 'Dupont',
      email: 'marie@example.com',
    },
    items: [
      {
        title: 'Safari 3 jours — Parc national',
        itemType: 'activity_schedule',
        quantity: 1,
        unitPriceCents: 30750,
        startDate: '2026-08-10',
        endDate: '2026-08-12',
      },
    ],
    travelers: [
      { fullName: 'Marie Dupont', age: 34, priceCents: 30750 },
      { fullName: 'Jean Dupont', age: 36, priceCents: 30750 },
      { fullName: 'Léa Dupont', age: 8, priceCents: 30750 },
    ],
    visitStartDate: '2026-08-10',
    visitEndDate: '2026-08-12',
    chatUrl: 'https://example.com/account/reservations/chat',
    accountUrl: 'https://example.com/account/reservations/detail',
    locale,
    branding: DEFAULT_EMAIL_BRANDING,
    logoPath: null,
    generatedAt: '2026-07-04T12:00:00.000Z',
  };
}

describe('booking-detail-pdf', () => {
  it('generates a non-empty PDF buffer with booking reference', async () => {
    const buffer = await renderBookingDetailPdf(sampleInput('fr'));
    expect(buffer.length).toBeGreaterThan(500);
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
    expect(buffer.includes(Buffer.from(bookingRefForPdf(BOOKING_ID)))).toBe(true);
  });

  it('produces distinct output per locale', async () => {
    const fr = await renderBookingDetailPdf(sampleInput('fr'));
    const en = await renderBookingDetailPdf(sampleInput('en'));
    const es = await renderBookingDetailPdf(sampleInput('es'));

    expect(fr.equals(en)).toBe(false);
    expect(fr.equals(es)).toBe(false);
    expect(getBookingDetailPdfLabels('en').documentTitle).not.toBe(
      getBookingDetailPdfLabels('fr').documentTitle,
    );
  });
});
