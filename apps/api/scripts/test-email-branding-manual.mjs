/**
 * Manual test plan for #128 / PR #133 — email branding admin + transactional emails.
 * Prérequis: API (:3010), MySQL seedée, Mailpit (:1025) ou SMTP configuré.
 *
 * Run: node apps/api/scripts/test-email-branding-manual.mjs
 */
import { loadEnv } from './lib/load-env.mjs';
import { SEED_ADMIN_EMAIL, getSeedAdminPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_PORT = process.env.API_PORT ?? '3010';
const API_PREFIX = process.env.API_GLOBAL_PREFIX ?? 'api';
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? `http://localhost:${API_PORT}/${API_PREFIX}`
).replace(/\/$/, '');
const ADMIN_URL = (process.env.NEXT_PUBLIC_ADMIN_URL ?? 'http://localhost:3001').replace(/\/$/, '');
const PLATFORM_ORG_ID = '00000000-0000-4000-8000-000000000001';
const MAILPIT_API = 'http://localhost:8025/api/v1';

const results = [];

function record(id, label, ok, detail = '') {
  results.push({ id, label, ok, detail });
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`[${mark}] ${id} ${label}${detail ? ` — ${detail}` : ''}`);
}

async function request(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });
  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  return { status: res.status, data, headers: res.headers };
}

async function mailpitCount() {
  try {
    const res = await fetch(`${MAILPIT_API}/messages?limit=1`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.total ?? data.count ?? null;
  } catch {
    return null;
  }
}

async function main() {
  console.log(`API: ${API_URL}`);
  console.log(`Admin: ${ADMIN_URL}`);
  console.log('');

  // 0 — infra
  try {
    const health = await request('GET', '/health');
    record('0a', 'API health', health.status === 200, `HTTP ${health.status}`);
  } catch (e) {
    record('0a', 'API health', false, e.message);
    printSummary();
    process.exit(1);
  }

  const adminPage = await fetch(`${ADMIN_URL}/parametres/emails`, { redirect: 'manual' });
  record(
    '0b',
    'Admin /parametres/emails sans session → redirect login',
    adminPage.status === 307 || adminPage.status === 302,
    `HTTP ${adminPage.status}`,
  );

  const mailBefore = await mailpitCount();
  record(
    '0c',
    'Mailpit accessible',
    mailBefore !== null,
    mailBefore !== null ? `${mailBefore} message(s)` : 'http://localhost:8025 indisponible',
  );

  // 1 — login admin
  const login = await request('POST', '/auth/login', {
    body: { email: SEED_ADMIN_EMAIL, password: getSeedAdminPassword() },
  });
  const token = login.data?.accessToken;
  record('1', 'Login admin seed', login.status === 200 && Boolean(token), `HTTP ${login.status}`);
  if (!token) {
    printSummary();
    process.exit(1);
  }

  const me = await request('GET', '/auth/me', { token });
  const perms = me.data?.permissions ?? [];
  const canRead = me.data?.isSuperAdmin || perms.includes('organization_settings.read');
  const canWrite = me.data?.isSuperAdmin || perms.includes('organization_settings.write');
  record('1b', 'Permission organization_settings.read', canRead);
  record('1c', 'Permission organization_settings.write', canWrite);

  // 2 — load settings (formulaire pré-rempli)
  const settings = await request('GET', `/organization-settings?organizationId=${PLATFORM_ORG_ID}&page=1&limit=100`, {
    token,
  });
  const list = settings.data?.data ?? [];
  const emailBranding = list.find(
    (s) => s.settingGroup === 'email' && s.settingKey === 'email_branding',
  );
  const platform = list.find((s) => s.settingGroup === 'branding' && s.settingKey === 'platform');
  record(
    '2',
    'Chargement email_branding (ou fallback platform)',
    settings.status === 200 && (Boolean(emailBranding) || Boolean(platform)),
    emailBranding
      ? `email_branding: ${emailBranding.settingValue?.displayName ?? '?'}`
      : platform
        ? `fallback platform: ${platform.settingValue?.displayName ?? '?'}`
        : 'aucun setting',
  );

  const testBranding = {
    displayName: 'ATG Test Branding',
    primaryColor: '#0b6e4f',
    secondaryColor: '#199a45',
    footerText: '© ATG Test',
    welcomeSubject: 'Bienvenue chez {displayName}',
    bookingSubject: 'Réservation {ref} confirmée',
  };

  // 3 — preview welcome + booking (sans sauvegarde)
  for (const template of ['welcome', 'booking']) {
    const preview = await request('POST', '/email/preview', {
      token,
      body: { template, branding: testBranding },
    });
    const ok =
      (preview.status === 200 || preview.status === 201) &&
      typeof preview.data?.subject === 'string' &&
      typeof preview.data?.html === 'string' &&
      preview.data.html.includes('ATG Test Branding');
    record(
      `3-${template}`,
      `Prévisualisation ${template}`,
      ok,
      ok ? `sujet: ${preview.data.subject.slice(0, 60)}` : `HTTP ${preview.status}`,
    );
  }

  // 4 — save branding
  const uniqueName = `ATG Manual ${Date.now()}`;
  const savePayload = {
    organizationId: PLATFORM_ORG_ID,
    settings: [
      {
        settingGroup: 'email',
        settingKey: 'email_branding',
        settingValue: { ...testBranding, displayName: uniqueName },
      },
    ],
  };
  const save = await request('PUT', '/organization-settings/bulk', {
    token,
    body: savePayload,
  });
  record('4a', 'Sauvegarde email_branding', save.status === 200 || save.status === 201, `HTTP ${save.status}`);

  const reload = await request('GET', `/organization-settings?organizationId=${PLATFORM_ORG_ID}&page=1&limit=100`, {
    token,
  });
  const reloaded = (reload.data?.data ?? []).find(
    (s) => s.settingGroup === 'email' && s.settingKey === 'email_branding',
  );
  record(
    '4b',
    'Persistance après sauvegarde',
    reloaded?.settingValue?.displayName === uniqueName,
    reloaded?.settingValue?.displayName ?? 'missing',
  );

  // 5 — welcome email (register)
  const regEmail = `manual.branding.${Date.now()}@africatourismgate.local`;
  const reg = await request('POST', '/auth/register', {
    body: {
      email: regEmail,
      password: 'ManualTest123!Aa',
      firstName: 'Manual',
      lastName: 'Test',
    },
  });
  record('5', 'Register → welcome email', reg.status === 201, `HTTP ${reg.status}`);

  // 6 — booking confirmation email (cash payment)
  const SEED_ROOM_ID = '00000000-0000-4000-8000-000000002011';
  const TEST_DATE = '2099-12-15';
  const avail = await request(
    'GET',
    `/room-availability?roomId=${SEED_ROOM_ID}&dateFrom=${TEST_DATE}&dateTo=${TEST_DATE}`,
    { token },
  );
  if (avail.status === 200 && !(avail.data?.data ?? []).some((r) => r.date?.startsWith(TEST_DATE))) {
    await request('POST', '/room-availability', {
      token,
      body: { roomId: SEED_ROOM_ID, date: TEST_DATE, availableUnits: 2, priceCents: 9000 },
    });
  }
  const checkout = await request('POST', '/bookings/checkout-preview', {
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
  record('6a', 'Checkout preview', checkout.status === 201, `HTTP ${checkout.status}`);

  const create = await request('POST', '/bookings', {
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
  const bookingId = create.data?.booking?.id;
  if (bookingId) {
    const cash = await request('POST', `/bookings/${bookingId}/cash-payment`, {
      token,
      body: {},
    });
    record(
      '6b',
      'Booking cash → confirmation email',
      create.status === 201 && (cash.status === 200 || cash.status === 201),
      `booking ${bookingId.slice(0, 8)}… HTTP cash ${cash.status}`,
    );
  } else {
    record('6b', 'Booking cash → confirmation email', false, `POST /bookings HTTP ${create.status}`);
  }

  if (mailBefore !== null) {
    await new Promise((r) => setTimeout(r, 2000));
    const mailAfter = await mailpitCount();
    record(
      '7',
      'Nouveaux messages Mailpit',
      mailAfter > mailBefore,
      `${mailBefore} → ${mailAfter}`,
    );
  }

  printSummary();
  const failed = results.filter((r) => !r.ok).length;
  process.exit(failed > 0 ? 1 : 0);
}

function printSummary() {
  console.log('\n--- Résumé ---');
  const passed = results.filter((r) => r.ok).length;
  console.log(`${passed}/${results.length} tests réussis`);
  for (const r of results.filter((x) => !x.ok)) {
    console.log(`  ✗ ${r.id} ${r.label}: ${r.detail}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
