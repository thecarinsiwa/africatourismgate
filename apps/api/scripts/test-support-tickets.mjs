/**
 * Support tickets: customer opens ticket + initial message in DB.
 * Run: pnpm --filter @africatourismgate/api test:support
 */
import { loadEnv } from './lib/load-env.mjs';
import { ephemeralTestPassword } from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);

const TICKET_SUBJECT = 'Test support E2E';
const TICKET_BODY =
  'Message de test automatique pour le livrable support (10+ caractères).';

async function request(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
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
  return { status: res.status, data };
}

async function registerCustomer() {
  const email = `support.${Date.now()}@africatourismgate.local`;
  const password = ephemeralTestPassword();
  const reg = await request('POST', '/auth/register', {
    body: {
      email,
      password,
      firstName: 'Support',
      lastName: 'Guest',
    },
  });
  if (reg.status !== 201 || !reg.data?.accessToken) {
    throw new Error(`Register failed: ${reg.status} ${JSON.stringify(reg.data)}`);
  }
  const userId = reg.data?.user?.id;
  if (!userId) throw new Error('Register response missing user.id');
  return { token: reg.data.accessToken, userId, email };
}

function assertStatus(label, actual, expected) {
  if (actual !== expected) {
    throw new Error(`${label}: expected HTTP ${expected}, got ${actual}`);
  }
  console.log(`  OK ${label} → ${actual}`);
}

async function main() {
  console.log(`API: ${API_URL}\n`);

  const { token, userId, email } = await registerCustomer();
  console.log(`  Customer: ${email} (${userId})\n`);

  console.log('1. POST /support-tickets (subject + body)');
  const created = await request('POST', '/support-tickets', {
    token,
    body: { subject: TICKET_SUBJECT, body: TICKET_BODY },
  });
  assertStatus('POST support-tickets', created.status, 201);

  const ticketId = created.data?.ticket?.id;
  const messageId = created.data?.initialMessage?.id;
  if (!ticketId) throw new Error('Missing ticket.id in response');
  if (!messageId) throw new Error('Missing initialMessage.id in response');
  if (created.data.ticket.userId !== userId) {
    throw new Error(`Expected ticket.userId ${userId}, got ${created.data.ticket.userId}`);
  }
  if (created.data.ticket.subject !== TICKET_SUBJECT) {
    throw new Error('Ticket subject mismatch');
  }
  if (created.data.ticket.status !== 'open') {
    throw new Error(`Expected status open, got ${created.data.ticket.status}`);
  }
  if (created.data.initialMessage.ticketId !== ticketId) {
    throw new Error('initialMessage.ticketId mismatch');
  }
  if (created.data.initialMessage.body !== TICKET_BODY) {
    throw new Error('initialMessage.body mismatch');
  }
  if (created.data.initialMessage.isStaff !== false) {
    throw new Error('Expected isStaff false on customer message');
  }
  console.log(`  OK ticketId=${ticketId}, messageId=${messageId}`);

  console.log('2. GET /support-tickets/:id');
  const one = await request('GET', `/support-tickets/${ticketId}`, { token });
  assertStatus('GET support-ticket', one.status, 200);
  if (one.data?.id !== ticketId || one.data?.userId !== userId) {
    throw new Error('GET ticket detail mismatch');
  }

  console.log('3. GET /support-tickets (scoped list)');
  const list = await request('GET', '/support-tickets?limit=50', { token });
  assertStatus('GET support-tickets list', list.status, 200);
  const inList = (list.data?.data ?? []).some((t) => t.id === ticketId);
  if (!inList) {
    throw new Error('Created ticket not in customer list');
  }
  console.log(`  OK ${list.data.data.length} ticket(s) in list`);

  console.log('4. GET /support-messages — message persisted');
  const messages = await request('GET', '/support-messages?limit=100', { token });
  assertStatus('GET support-messages', messages.status, 200);
  const row = (messages.data?.data ?? []).find(
    (m) => m.id === messageId && m.ticketId === ticketId,
  );
  if (!row) {
    throw new Error('Initial message not found in support_messages list');
  }
  if (row.body !== TICKET_BODY) {
    throw new Error('Listed message body mismatch');
  }
  console.log('  OK message row in DB list');

  console.log('\nAll support ticket checks passed.');
}

main().catch((err) => {
  console.error('\nSupport tickets test failed:', err.message);
  process.exit(1);
});
