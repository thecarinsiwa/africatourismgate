/**
 * Dev helper — writes static HTML previews for CE-6 assisted booking emails.
 * Run: node scripts/render-assisted-booking-email-previews.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../src/modules/email/preview');
const PREVIEW_BOOKING_ID = '00000000-0000-4000-8000-000000009999';
const webUrl = process.env.NEXT_PUBLIC_WEB_URL ?? 'http://localhost:3000';

const { DEFAULT_EMAIL_BRANDING } = await import('../dist/modules/email/email-branding.constants.js');
const { webBase } = await import('../dist/modules/email/email.templates.js');
const {
  renderBookingRequestReceivedEmail,
  renderBookingApprovedChatEmail,
  renderBookingRejectedEmail,
  renderBookingPaymentInviteEmail,
} = await import('../dist/modules/email/assisted-booking.email.templates.js');

const sample = {
  to: 'marie@example.com',
  firstName: 'Marie',
  bookingId: PREVIEW_BOOKING_ID,
  totalCents: 125_000,
  currency: 'USD',
  itemTitles: ['Safari 3 jours — Parc national', 'Transfert aéroport'],
  webUrl,
};

const templates = [
  {
    name: 'booking_request_received',
    render: () => renderBookingRequestReceivedEmail(sample, DEFAULT_EMAIL_BRANDING),
  },
  {
    name: 'booking_approved_chat',
    render: () =>
      renderBookingApprovedChatEmail(
        {
          ...sample,
          chatUrl: `${webBase(webUrl)}/account/reservations/${PREVIEW_BOOKING_ID}/chat`,
        },
        DEFAULT_EMAIL_BRANDING,
      ),
  },
  {
    name: 'booking_rejected',
    render: () =>
      renderBookingRejectedEmail(
        {
          ...sample,
          reason: 'Dates indisponibles pour la période demandée.',
        },
        DEFAULT_EMAIL_BRANDING,
      ),
  },
  {
    name: 'booking_payment_invite',
    render: () =>
      renderBookingPaymentInviteEmail(
        {
          ...sample,
          paymentUrl: 'https://checkout.stripe.com/c/pay/cs_test_preview',
        },
        DEFAULT_EMAIL_BRANDING,
      ),
  },
];

mkdirSync(outDir, { recursive: true });

for (const { name, render } of templates) {
  const { subject, html } = render();
  const filePath = join(outDir, `${name}.html`);
  writeFileSync(filePath, html, 'utf8');
  console.log(`${name}: ${subject}`);
  console.log(`  → ${filePath}`);
}

console.log('\nOpen the .html files in a browser, or use POST /api/email/preview in dev.');
