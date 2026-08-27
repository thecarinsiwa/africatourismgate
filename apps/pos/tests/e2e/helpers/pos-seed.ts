import { fetchSeedAdminSession, waitForApiHealth } from './pos-auth';
import { E2E_ROOM_STAY_START, SEED_ROOM_ID } from './pos-seed.constants';

export {
  SEED_ADMIN_EMAIL,
  SEED_ADMIN_PASSWORD,
  SEED_ORG_ATG_NAME,
  SEED_ORG_GUICHET_NAME,
  SEED_ROOM_ID,
  E2E_ROOM_STAY_START,
  E2E_ROOM_STAY_END,
} from './pos-seed.constants';

let saleSeedReady = false;

const API_URL = (process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:3000').replace(/\/$/, '');

async function request(
  method: string,
  path: string,
  options: { token?: string; body?: unknown } = {},
) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const res = await fetch(`${API_URL}/api${path}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  return { status: res.status, data };
}

/** Garantit une dispo chambre pour la vente cash E2E (idempotent, une fois par run). */
export async function ensurePosSaleSeedData(): Promise<void> {
  if (saleSeedReady) {
    return;
  }

  await waitForApiHealth();
  const session = await fetchSeedAdminSession();
  const token = session.accessToken;

  const existing = await request(
    'GET',
    `/room-availability?roomId=${SEED_ROOM_ID}&dateFrom=${E2E_ROOM_STAY_START}&dateTo=${E2E_ROOM_STAY_START}`,
    { token },
  );

  if (existing.status !== 200) {
    throw new Error(`Impossible de lire room-availability (${existing.status})`);
  }

  const rows =
    (existing.data as { data?: Array<{ id?: string; date?: string; availableUnits?: number }> } | null)
      ?.data ?? [];
  const row = rows.find((entry) => entry.date?.startsWith(E2E_ROOM_STAY_START));

  if (!row) {
    const created = await request('POST', '/room-availability', {
      token,
      body: {
        roomId: SEED_ROOM_ID,
        date: E2E_ROOM_STAY_START,
        availableUnits: 2,
        priceCents: 9000,
      },
    });

    if (created.status !== 201) {
      throw new Error(`Impossible de créer room-availability E2E (${created.status})`);
    }
    return;
  }

  if ((row.availableUnits ?? 0) < 2 && row.id) {
    const updated = await request('PATCH', `/room-availability/${row.id}`, {
      token,
      body: {
        availableUnits: 2,
        priceCents: 9000,
      },
    });

    if (updated.status !== 200) {
      throw new Error(`Impossible de restaurer room-availability E2E (${updated.status})`);
    }
  }

  saleSeedReady = true;
}
