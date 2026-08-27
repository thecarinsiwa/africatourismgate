/**
 * Dev helper — writes a sample POS receipt PDF for visual review (POS-9).
 * Run: pnpm --filter @africatourismgate/api pdf:preview-pos-receipt
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../src/modules/email/preview');
const BOOKING_ID = '00000000-0000-4000-8000-000000009999';

const { DEFAULT_EMAIL_BRANDING } = await import('../dist/modules/email/email-branding.constants.js');
const { renderPosReceiptPdf } = await import('../dist/modules/email/pos-receipt-pdf.renderer.js');

const sampleContext = {
  organizationId: '00000000-0000-4000-8000-000000000001',
  firstName: 'Marie',
  bookingId: BOOKING_ID,
  issuedAt: new Date().toISOString(),
  organizationName: DEFAULT_EMAIL_BRANDING.displayName,
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
};

mkdirSync(outDir, { recursive: true });

const buffer = await renderPosReceiptPdf({
  context: sampleContext,
  branding: DEFAULT_EMAIL_BRANDING,
  logoPath: null,
});

const outPath = join(outDir, 'booking_receipt.pdf');
writeFileSync(outPath, buffer);

console.log(`booking_receipt.pdf: ${buffer.length} bytes`);
console.log(`  → ${outPath}`);
console.log('\nOpen the PDF on desktop or tablet to verify branding and readability.');
