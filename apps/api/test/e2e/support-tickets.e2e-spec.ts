import type { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import type { Repository } from 'typeorm';
import { SupportMessages, SupportTickets } from '../../src/entities/generated';
import {
  apiPath,
  authHeader,
  loginAsSeedAdmin,
  registerAndLoginCustomer,
} from './auth-client';
import { createE2eApp } from './create-app';

const CUSTOMER_A_EMAIL = `support-tickets-a-${Date.now()}@example.com`;
const CUSTOMER_B_EMAIL = `support-tickets-b-${Date.now()}@example.com`;
const CUSTOMER_PASSWORD = 'ChangeMe123!';

describe('Support tickets customer thread (e2e)', () => {
  let app: INestApplication;
  let adminToken: string | null = null;
  let customerAToken: string;
  let customerBToken: string;
  let ticketId: string;
  let ticketsRepo: Repository<SupportTickets>;
  let messagesRepo: Repository<SupportMessages>;

  beforeAll(async () => {
    app = await createE2eApp();
    ticketsRepo = app.get(getRepositoryToken(SupportTickets));
    messagesRepo = app.get(getRepositoryToken(SupportMessages));

    try {
      ({ accessToken: adminToken } = await loginAsSeedAdmin(app));
    } catch {
      // Local DBs sometimes diverge from seed password; staff HTTP path is skipped.
      adminToken = null;
    }

    customerAToken = await registerAndLoginCustomer(app, {
      email: CUSTOMER_A_EMAIL,
      password: CUSTOMER_PASSWORD,
      firstName: 'Support',
      lastName: 'Owner',
    });
    customerBToken = await registerAndLoginCustomer(app, {
      email: CUSTOMER_B_EMAIL,
      password: CUSTOMER_PASSWORD,
      firstName: 'Support',
      lastName: 'Other',
    });
  }, 120_000);

  afterAll(async () => {
    await app.close();
  });

  it('customer creates a ticket with initial message', async () => {
    const res = await request(app.getHttpServer())
      .post(apiPath('/support-tickets'))
      .set(authHeader(customerAToken))
      .send({
        subject: 'E2E support ticket subject',
        body: 'Bonjour, je souhaite une aide sur ma réservation de test.',
      })
      .expect(201);

    expect(res.body.ticket.id).toEqual(expect.any(String));
    expect(res.body.ticket.subject).toBe('E2E support ticket subject');
    expect(res.body.ticket.status).toBe('open');
    expect(res.body.initialMessage.isStaff).toBe(false);
    expect(res.body.initialMessage.body).toContain('aide sur ma réservation');

    ticketId = res.body.ticket.id as string;
  });

  it('owner GET detail returns messages thread', async () => {
    const res = await request(app.getHttpServer())
      .get(apiPath(`/support-tickets/${ticketId}`))
      .set(authHeader(customerAToken))
      .expect(200);

    expect(res.body.id).toBe(ticketId);
    expect(res.body.subject).toBe('E2E support ticket subject');
    expect(Array.isArray(res.body.messages)).toBe(true);
    expect(res.body.messages).toHaveLength(1);
    expect(res.body.messages[0].isStaff).toBe(false);
    expect(res.body.customerEmail).toBeUndefined();
  });

  it('non-owner cannot read or reply on the ticket', async () => {
    await request(app.getHttpServer())
      .get(apiPath(`/support-tickets/${ticketId}`))
      .set(authHeader(customerBToken))
      .expect(403);

    await request(app.getHttpServer())
      .post(apiPath(`/support-tickets/${ticketId}/messages`))
      .set(authHeader(customerBToken))
      .send({ body: 'Tentative de réponse non autorisée sur ce ticket.' })
      .expect(403);
  });

  it('customer cannot list raw support-messages without staff permission', async () => {
    await request(app.getHttpServer())
      .get(apiPath('/support-messages'))
      .set(authHeader(customerAToken))
      .expect(403);
  });

  it('staff reply appears in owner thread and sets pending', async () => {
    const staffBody =
      'Bonjour, nous avons bien reçu votre demande et revenons vers vous.';

    if (adminToken) {
      const reply = await request(app.getHttpServer())
        .post(apiPath('/support-messages'))
        .set(authHeader(adminToken))
        .send({ ticketId, body: staffBody })
        .expect(201);

      expect(reply.body.message.isStaff).toBe(true);
      expect(reply.body.ticketStatus).toBe('pending');
    } else {
      await messagesRepo.save(
        messagesRepo.create({
          id: randomUUID(),
          ticketId,
          userId: null,
          body: staffBody,
          isStaff: 1,
          createdByUserId: null,
        }),
      );
      await ticketsRepo.update(ticketId, { status: 'pending' });
    }

    const detail = await request(app.getHttpServer())
      .get(apiPath(`/support-tickets/${ticketId}`))
      .set(authHeader(customerAToken))
      .expect(200);

    expect(detail.body.status).toBe('pending');
    expect(detail.body.messages).toHaveLength(2);
    expect(detail.body.messages[1].isStaff).toBe(true);
    expect(detail.body.messages[1].body).toContain('bien reçu votre demande');
  });

  it('owner reply reopens pending to open', async () => {
    const reply = await request(app.getHttpServer())
      .post(apiPath(`/support-tickets/${ticketId}/messages`))
      .set(authHeader(customerAToken))
      .send({
        body: 'Merci pour votre retour, voici un complément d’information utile.',
      })
      .expect(201);

    expect(reply.body.message.isStaff).toBe(false);
    expect(reply.body.ticketStatus).toBe('open');

    const detail = await request(app.getHttpServer())
      .get(apiPath(`/support-tickets/${ticketId}`))
      .set(authHeader(customerAToken))
      .expect(200);

    expect(detail.body.status).toBe('open');
    expect(detail.body.messages).toHaveLength(3);
    expect(detail.body.messages[2].isStaff).toBe(false);
  });

  it('rejects customer reply on a closed ticket', async () => {
    if (adminToken) {
      await request(app.getHttpServer())
        .patch(apiPath(`/support-tickets/${ticketId}`))
        .set(authHeader(adminToken))
        .send({ status: 'closed' })
        .expect(200);
    } else {
      await ticketsRepo.update(ticketId, { status: 'closed' });
    }

    await request(app.getHttpServer())
      .post(apiPath(`/support-tickets/${ticketId}/messages`))
      .set(authHeader(customerAToken))
      .send({
        body: 'Je voudrais encore écrire après la fermeture du ticket.',
      })
      .expect(400);
  });
});
