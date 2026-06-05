/**
 * Vérifie la connexion SMTP LWS (service@ + support@).
 * Run: pnpm --filter @africatourismgate/api verify:smtp
 */
import nodemailer from 'nodemailer';
import { loadEnv } from './lib/load-env.mjs';

loadEnv();

const host = process.env.SMTP_HOST?.trim() || 'mail.africatourismgate.org';
const port = Number(process.env.SMTP_PORT ?? '465');
const secure = (process.env.SMTP_SECURE ?? 'true') === 'true';

const accounts = [
  {
    label: 'service@',
    user: process.env.SMTP_SERVICE_USER?.trim(),
    pass: process.env.SMTP_SERVICE_PASS?.trim(),
  },
  {
    label: 'support@',
    user: process.env.SMTP_SUPPORT_USER?.trim(),
    pass: process.env.SMTP_SUPPORT_PASS?.trim(),
  },
];

async function verifyAccount({ label, user, pass }) {
  if (!user || !pass) {
    console.log(`SKIP ${label}: credentials missing in .env.local`);
    return false;
  }
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    ...(port === 587 && !secure ? { requireTLS: true } : {}),
  });
  try {
    await transporter.verify();
    console.log(`OK   ${label} (${user}) → ${host}:${port}`);
    return true;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`FAIL ${label} (${user}): ${msg}`);
    return false;
  } finally {
    transporter.close();
  }
}

async function main() {
  console.log(`SMTP host: ${host}:${port} secure=${secure}\n`);
  const results = await Promise.all(accounts.map(verifyAccount));
  if (!results.every(Boolean)) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
