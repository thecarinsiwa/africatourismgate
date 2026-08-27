import { DEFAULT_EMAIL_BRANDING } from '../../src/modules/email/email-branding.constants';
import { renderPosReceiptPdf } from '../../src/modules/email/pos-receipt-pdf.renderer';
import type { PosReceiptContext } from '../../src/modules/resources/bookings/pos-receipt.context';

const BOOKING_ID = '00000000-0000-4000-8000-000000009999';

function sampleContext(overrides: Partial<PosReceiptContext> = {}): PosReceiptContext {
  return {
    organizationId: '00000000-0000-4000-8000-000000000001',
    firstName: 'Marie',
    bookingId: BOOKING_ID,
    issuedAt: '2026-07-01T10:00:00.000Z',
    organizationName: 'Africa Tourism Gate',
    employeeName: 'Jean Caissier',
    clientName: 'Marie Dupont',
    clientEmail: 'marie@example.com',
    paymentMethodLabel: 'Espèces',
    items: [
      {
        title: 'Safari 3 jours — Parc national',
        quantity: 2,
        unitPriceCents: 45_000,
        lineTotalCents: 90_000,
      },
      {
        title: 'Transfert aéroport',
        quantity: 1,
        unitPriceCents: 35_000,
        lineTotalCents: 35_000,
      },
    ],
    subtotalCents: 125_000,
    discountCents: 0,
    totalCents: 125_000,
    currency: 'USD',
    ...overrides,
  };
}

async function renderSample(overrides: Partial<PosReceiptContext> = {}): Promise<Buffer> {
  return renderPosReceiptPdf({
    context: sampleContext(overrides),
    branding: DEFAULT_EMAIL_BRANDING,
    logoPath: null,
  });
}

describe('pos-receipt-pdf', () => {
  it('generates a valid non-empty PDF buffer', async () => {
    const buffer = await renderSample();

    expect(buffer.length).toBeGreaterThan(500);
    expect(buffer.subarray(0, 4).toString()).toBe('%PDF');
  });

  it('produces distinct output when discount line is present', async () => {
    const withoutDiscount = await renderSample();
    const withDiscount = await renderSample({
      discountCents: 5_000,
      totalCents: 120_000,
    });

    expect(withDiscount.equals(withoutDiscount)).toBe(false);
    expect(withDiscount.length).toBeGreaterThan(withoutDiscount.length);
  });
});
