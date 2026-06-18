/**
 * Test flux réel : inscription + réservation → e-mails user instantanés.
 *
 * Usage:
 *   pnpm --filter @africatourismgate/api test:email-flow ruthbahizi04@gmail.com
 *
 * Utilise Gmail +alias (ex. user+atg123@gmail.com) pour plusieurs tests sur la même boîte.
 */
import { loadEnv } from './lib/load-env.mjs';
import { ephemeralTestPassword } from './lib/test-credentials.mjs';

loadEnv();

const targetBase = process.argv[2]?.trim();
if (!targetBase || !targetBase.includes('@')) {
  console.error(
    'Usage: pnpm --filter @africatourismgate/api test:email-flow <email>',
  );
  process.exit(1);
}

const API_PORT = process.env.API_PORT ?? '3000';
const API_PREFIX = process.env.API_GLOBAL_PREFIX ?? 'api';
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? `http://localhost:${API_PORT}/${API_PREFIX}`
).replace(/\/$/, '');

const SEED_ROOM_ID = '00000000-0000-4000-8000-000000002011';
const TEST_DATE = '2099-12-03';

function gmailAlias(base, tag) {
  const at = base.indexOf('@');
  if (at < 0) return base;
  const local = base.slice(0, at);
  const domain = base.slice(at + 1);
  const stamp = Date.now().toString(36);
  return `${local}+${tag}${stamp}@${domain}`;
}

async function request(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const started = performance.now();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const elapsed = Math.round(performance.now() - started);
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  return { status: res.status, data, elapsed };
}

function assertStatus(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label}: expected HTTP ${expected}, got ${actual}`);
  }
}

async function main() {
  const registerEmail = gmailAlias(targetBase, 'atgreg');
  const password = ephemeralTestPassword();

  console.log(`API: ${API_URL}`);
  console.log(
    `SMTP: ${process.env.SMTP_HOST}:${process.env.SMTP_PORT} (${process.env.EMAIL_TRANSPORT})\n`,
  );
  console.log(`Boîte cible (alias Gmail): ${registerEmail}\n`);

  console.log('── 1. Création de compte (POST /auth/register)');
  const t0 = performance.now();
  const reg = await request('POST', '/auth/register', {
    body: {
      email: registerEmail,
      password,
      firstName: 'Ruth',
      lastName: 'Test ATG',
    },
  });
  assertStatus('register', reg.status, 201);
  console.log(`  HTTP ${reg.status} en ${reg.elapsed}ms`);
  console.log(
    `  → E-mail bienvenue attendu sur ${registerEmail} (envoi async juste après 201)\n`,
  );

  await new Promise((r) => setTimeout(r, 3000));

  console.log('── 2. Connexion du nouveau compte');
  const login = await request('POST', '/auth/login', {
    body: { email: registerEmail, password },
  });
  assertStatus('login', login.status, 200);
  const token = login.data?.accessToken;
  if (!token) throw new Error('Missing accessToken after login');
  console.log(`  OK login en ${login.elapsed}ms\n`);

  console.log('── 3. Réservation + paiement cash');
  const existing = await request(
    'GET',
    `/room-availability?roomId=${SEED_ROOM_ID}&dateFrom=${TEST_DATE}&dateTo=${TEST_DATE}`,
    { token },
  );
  if (existing.status === 200) {
    const row = existing.data?.data?.find((r) => r.date?.startsWith(TEST_DATE));
    if (!row) {
      const create = await request('POST', '/room-availability', {
        token,
        body: {
          roomId: SEED_ROOM_ID,
          date: TEST_DATE,
          availableUnits: 2,
          priceCents: 12000,
        },
      });
      assertStatus('room-availability', create.status, 201);
    }
  }

  const booking = await request('POST', '/bookings', {
    token,
    body: {
      currency: 'USD',
      items: [
        {
          itemType: 'room',
          referenceId: SEED_ROOM_ID,
          quantity: 1,
          startDate: TEST_DATE,
          endDate: TEST_DATE,
        },
      ],
    },
  });
  assertStatus('bookings', booking.status, 201);
  const bookingId = booking.data?.booking?.id;
  if (!bookingId) throw new Error('Missing booking id');

  const cash = await request('POST', `/bookings/${bookingId}/cash-payment`, {
    token,
    body: {},
  });
  assertStatus('cash-payment', cash.status, 201);
  const totalMs = Math.round(performance.now() - t0);
  console.log(`  HTTP cash-payment ${cash.status} en ${cash.elapsed}ms`);
  console.log(
    `  → E-mail confirmation attendu sur ${registerEmail} (envoi async après paiement)\n`,
  );

  await new Promise((r) => setTimeout(r, 3000));

  console.log('── Résumé');
  console.log(`  Compte créé : ${registerEmail}`);
  console.log(`  Réservation : ${bookingId}`);
  console.log(`  Durée totale du flux : ${totalMs}ms`);
  console.log(
    '\nVérifiez la boîte Gmail (et spams). Consultez les logs API pour les lignes [EmailService].',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
