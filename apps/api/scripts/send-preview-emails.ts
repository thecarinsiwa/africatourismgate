/**
 * Envoie des e-mails de démo (bienvenue + réservation) vers une adresse de test.
 *
 * Usage:
 *   pnpm --filter @africatourismgate/api send:preview ruthbahizi04@gmail.com
 */
import nodemailer from 'nodemailer';
import { loadEnv } from './lib/load-env.mjs';
import {
  renderBookingConfirmationEmail,
  renderWelcomeEmail,
} from '../src/modules/email/email.templates';

loadEnv();

const to = process.argv[2]?.trim();
if (!to) {
  console.error(
    'Usage: pnpm --filter @africatourismgate/api send:preview <email>',
  );
  process.exit(1);
}

const host = process.env.SMTP_HOST?.trim() || 'mail.africatourismgate.org';
const port = Number(process.env.SMTP_PORT ?? '465');
const secure = (process.env.SMTP_SECURE ?? 'true') === 'true';
const user = process.env.SMTP_SERVICE_USER?.trim();
const pass = process.env.SMTP_SERVICE_PASS?.trim();
const from =
  process.env.EMAIL_FROM?.trim() ||
  'Africa Tourism Gate <service@africatourismgate.org>';
const webUrl =
  process.env.NEXT_PUBLIC_WEB_URL?.trim() || 'https://africatourismgate.org';

if (!user || !pass) {
  console.error('SMTP_SERVICE_USER / SMTP_SERVICE_PASS requis dans .env.local');
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: { user, pass },
  ...(port === 587 && !secure ? { requireTLS: true } : {}),
});

async function main(): Promise<void> {
  console.log(`SMTP: ${host}:${port} | Destinataire: ${to}\n`);

  await transporter.verify();
  console.log('Connexion SMTP OK\n');

  const welcome = renderWelcomeEmail({
    to,
    firstName: 'Ruth',
    webUrl,
  });
  const booking = renderBookingConfirmationEmail({
    to,
    firstName: 'Ruth',
    bookingId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    totalCents: 18900,
    currency: 'USD',
    itemTitles: [
      'Chambre Deluxe — Hôtel Démonstration Kinshasa',
      'Petit-déjeuner inclus',
    ],
    webUrl,
    confirmedAt: new Date().toISOString(),
  });

  const w = await transporter.sendMail({
    from,
    to,
    subject: welcome.subject,
    html: welcome.html,
    text: welcome.text,
  });
  console.log(`  OK Bienvenue → ${to} (${w.messageId})`);

  const b = await transporter.sendMail({
    from,
    to,
    subject: booking.subject,
    html: booking.html,
    text: booking.text,
  });
  console.log(`  OK Réservation → ${to} (${b.messageId})`);

  console.log('\nTerminé. Vérifiez la boîte de réception (et les spams).');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => transporter.close());
