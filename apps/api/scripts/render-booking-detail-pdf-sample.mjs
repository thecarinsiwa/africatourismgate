/**
 * Dev helper — writes a sample booking detail PDF for visual review.
 * Run: pnpm --filter @africatourismgate/api build && node scripts/render-booking-detail-pdf-sample.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../src/modules/email/preview');

const { DEFAULT_EMAIL_BRANDING } = await import('../dist/modules/email/email-branding.constants.js');
const { renderBookingDetailPdf } = await import('../dist/modules/email/booking-detail-pdf.renderer.js');

const bookingId = '00000000-0000-4000-8000-000000009999';

for (const locale of ['fr', 'en', 'es']) {
  const buffer = await renderBookingDetailPdf({
    bookingId,
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
      {
        title: 'Transfert aéroport',
        itemType: 'vehicle',
        quantity: 1,
        unitPriceCents: 12000,
        startDate: '2026-08-10',
        endDate: '2026-08-10',
      },
    ],
    travelers: [
      { fullName: 'Marie Dupont', age: 34, priceCents: 30750 },
      { fullName: 'Jean Dupont', age: 36, priceCents: 30750 },
      { fullName: 'Léa Dupont', age: 8, priceCents: 30750 },
    ],
    visitStartDate: '2026-08-10',
    visitEndDate: '2026-08-12',
    chatUrl: 'https://africatourismgate.org/account/reservations/chat',
    accountUrl: 'https://africatourismgate.org/account/reservations/detail',
    locale,
    branding: DEFAULT_EMAIL_BRANDING,
    logoPath: null,
    generatedAt: new Date().toISOString(),
  });

  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `booking_detail_${locale}.pdf`);
  writeFileSync(outPath, buffer);
  console.log(`Wrote ${outPath} (${buffer.length} bytes)`);
}
