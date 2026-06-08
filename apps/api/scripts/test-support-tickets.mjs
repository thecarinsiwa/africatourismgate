/**
 * Support tickets: customer opens ticket + initial message in DB;
 * admin lists, views detail with messages, updates status.
 * Run: pnpm --filter @africatourismgate/api test:support
 */
import { loadEnv } from './lib/load-env.mjs';
import {
  SEED_ADMIN_EMAIL,
  ephemeralTestPassword,
  getSeedAdminPassword,
} from './lib/test-credentials.mjs';

loadEnv();

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(
  /\/$/,
  '',
);

const TICKET_SUBJECT = 'Test support E2E';
const TICKET_BODY =
  'Message de test automatique pour le livrable support (10+ caractères).';
const STAFF_REPLY_BODY =
  'Réponse agent de test automatique pour le livrable #58 (10+ caractères).';

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

async function login(email, password) {
  const res = await request('POST', '/auth/login', {
    body: { email, password },
  });
  if (res.status !== 200 || !res.data?.accessToken) {
    throw new Error(`Login failed for ${email}: ${res.status} ${JSON.stringify(res.data)}`);
  }
  return res.data.accessToken;
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
  if (created.data.ticket.priority !== 'normal') {
    throw new Error(`Expected priority normal, got ${created.data.ticket.priority}`);
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

  console.log('2. GET /support-tickets/:id (customer)');
  const one = await request('GET', `/support-tickets/${ticketId}`, { token });
  assertStatus('GET support-ticket', one.status, 200);
  if (one.data?.id !== ticketId || one.data?.userId !== userId) {
    throw new Error('GET ticket detail mismatch');
  }

  console.log('3. GET /support-tickets (customer list)');
  const list = await request('GET', '/support-tickets?limit=50', { token });
  assertStatus('GET support-tickets list', list.status, 200);
  const inList = (list.data?.data ?? []).some((t) => t.id === ticketId);
  if (!inList) {
    throw new Error('Created ticket not in customer list');
  }
  console.log(`  OK ${list.data.data.length} ticket(s) in customer list`);

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

  console.log('\n5. Admin flow (web → admin)');
  const adminToken = await login(SEED_ADMIN_EMAIL, getSeedAdminPassword());
  console.log(`  Admin: ${SEED_ADMIN_EMAIL}`);

  console.log('5a. GET /support-tickets (admin list)');
  const adminList = await request('GET', '/support-tickets?limit=50', {
    token: adminToken,
  });
  assertStatus('GET admin support-tickets', adminList.status, 200);
  const adminRow = (adminList.data?.data ?? []).find((t) => t.id === ticketId);
  if (!adminRow) {
    throw new Error('Created ticket not visible in admin list');
  }
  if (!adminRow.customerEmail) {
    throw new Error('Admin list missing customerEmail');
  }
  if (adminRow.subject !== TICKET_SUBJECT) {
    throw new Error('Admin list subject mismatch');
  }
  console.log(`  OK ticket visible for admin (${adminRow.customerEmail})`);

  console.log('5b. GET /support-tickets/:id (admin detail + messages)');
  const adminDetail = await request('GET', `/support-tickets/${ticketId}`, {
    token: adminToken,
  });
  assertStatus('GET admin ticket detail', adminDetail.status, 200);
  if (!Array.isArray(adminDetail.data?.messages) || adminDetail.data.messages.length < 1) {
    throw new Error('Admin detail missing messages thread');
  }
  const threadMsg = adminDetail.data.messages.find((m) => m.id === messageId);
  if (!threadMsg || threadMsg.body !== TICKET_BODY) {
    throw new Error('Initial message missing from admin thread');
  }
  console.log(`  OK ${adminDetail.data.messages.length} message(s) in thread`);

  console.log('5c. POST /support-messages (admin reply, open → pending)');
  const reply = await request('POST', '/support-messages', {
    token: adminToken,
    body: { ticketId, body: STAFF_REPLY_BODY },
  });
  assertStatus('POST support-messages staff reply', reply.status, 201);
  const staffMessageId = reply.data?.message?.id;
  if (!staffMessageId) throw new Error('Missing message.id in reply response');
  if (reply.data.message.ticketId !== ticketId) {
    throw new Error('Reply message ticketId mismatch');
  }
  if (reply.data.message.body !== STAFF_REPLY_BODY) {
    throw new Error('Reply message body mismatch');
  }
  if (reply.data.message.isStaff !== true) {
    throw new Error('Expected isStaff true on staff reply');
  }
  if (reply.data.ticketStatus !== 'pending') {
    throw new Error(`Expected ticketStatus pending, got ${reply.data.ticketStatus}`);
  }
  console.log(`  OK staffMessageId=${staffMessageId}, ticket pending`);

  console.log('5d. GET /support-messages — staff reply persisted');
  const messagesAfterReply = await request('GET', '/support-messages?limit=100', {
    token: adminToken,
  });
  assertStatus('GET support-messages after reply', messagesAfterReply.status, 200);
  const staffRow = (messagesAfterReply.data?.data ?? []).find(
    (m) => m.id === staffMessageId && m.ticketId === ticketId,
  );
  if (!staffRow) {
    throw new Error('Staff reply not found in support_messages list');
  }
  if (staffRow.body !== STAFF_REPLY_BODY) {
    throw new Error('Listed staff reply body mismatch');
  }
  console.log('  OK staff reply row in DB list');

  console.log('5e. GET /support-tickets/:id — thread includes staff reply');
  const detailAfterReply = await request('GET', `/support-tickets/${ticketId}`, {
    token: adminToken,
  });
  assertStatus('GET admin ticket detail after reply', detailAfterReply.status, 200);
  if (detailAfterReply.data?.status !== 'pending') {
    throw new Error(`Expected ticket status pending, got ${detailAfterReply.data?.status}`);
  }
  const staffThreadMsg = (detailAfterReply.data?.messages ?? []).find(
    (m) => m.id === staffMessageId,
  );
  if (!staffThreadMsg || staffThreadMsg.body !== STAFF_REPLY_BODY) {
    throw new Error('Staff reply missing from admin thread');
  }
  if (!staffThreadMsg.isStaff) {
    throw new Error('Staff reply missing isStaff flag in thread');
  }
  console.log(`  OK ${detailAfterReply.data.messages.length} message(s) in thread`);

  console.log('5f. PATCH /support-tickets/:id (priority high)');
  const priority = await request('PATCH', `/support-tickets/${ticketId}`, {
    token: adminToken,
    body: { priority: 'high' },
  });
  assertStatus('PATCH support-ticket priority', priority.status, 200);
  if (priority.data?.priority !== 'high') {
    throw new Error(`Expected priority high, got ${priority.data?.priority}`);
  }
  console.log('  OK priority high');

  console.log('\nAll support ticket checks passed (customer + admin + staff reply).');
}

main().catch((err) => {
  console.error('\nSupport tickets test failed:', err.message);
  process.exit(1);
});
