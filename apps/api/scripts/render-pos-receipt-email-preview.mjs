/**
 * Dev helper — writes static HTML preview for POS receipt email (POS-8).
 * Run: pnpm --filter @africatourismgate/api email:preview-pos-receipt
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../src/modules/email/preview');
const PREVIEW_BOOKING_ID = '00000000-0000-4000-8000-000000009999';
const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';

const { DEFAULT_EMAIL_BRANDING } = await import('../dist/modules/email/email-branding.constants.js');
const { renderPosReceiptEmail } = await import('../dist/modules/email/pos-receipt.email.templates.js');

const sample = {
  to: 'marie@example.com',
  firstName: 'Marie',
  bookingId: PREVIEW_BOOKING_ID,
  issuedAt: new Date().toISOString(),
  organizationName: DEFAULT_EMAIL_BRANDING.displayName,
  employeeName: 'Jean Caissier',
  clientName: 'Marie Dupont',
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
  webUrl,
};

mkdirSync(outDir, { recursive: true });

const { subject, html } = renderPosReceiptEmail(sample, DEFAULT_EMAIL_BRANDING);
const filePath = join(outDir, 'booking_receipt.html');
writeFileSync(filePath, html, 'utf8');

console.log(`booking_receipt: ${subject}`);
console.log(`  → ${filePath}`);
console.log('\nOpen the .html file in a browser, or use POST /api/email/preview with template booking_receipt.');
