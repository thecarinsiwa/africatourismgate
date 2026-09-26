import type { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import type { Repository } from 'typeorm';
import { IsNull } from 'typeorm';
import { newId } from '../../src/common/utils/uuid';
import { RoomAvailability } from '../../src/entities/generated';
import { apiPath, authHeader, loginAsSeedAdmin, registerAndLoginCustomer } from './auth-client';
import { SEED_ROOM_ID, addDaysIso } from './constants';
import { createE2eApp } from './create-app';

const EMERGENCY_E2E_DATE = '2099-09-18';

describe('Booking emergency contact (e2e)', () => {
  let app: INestApplication;
  let adminToken: string | null = null;
  let customerToken: string;
  let otherCustomerToken: string;
  let bookingId: string;
  let roomAvailabilityRepo: Repository<RoomAvailability>;

  beforeAll(async () => {
    app = await createE2eApp();
    roomAvailabilityRepo = app.get(getRepositoryToken(RoomAvailability));

    try {
      ({ accessToken: adminToken } = await loginAsSeedAdmin(app));
    } catch {
      adminToken = null;
    }

    customerToken = await registerAndLoginCustomer(app, {
      email: `booking-emergency-e2e-${Date.now()}@example.com`,
      password: 'ChangeMe123!',
      firstName: 'Emergency',
      lastName: 'Owner',
    });
    otherCustomerToken = await registerAndLoginCustomer(app, {
      email: `booking-emergency-other-${Date.now()}@example.com`,
      password: 'ChangeMe123!',
      firstName: 'Other',
      lastName: 'Customer',
    });

    await ensureRoomAvailability(roomAvailabilityRepo, EMERGENCY_E2E_DATE, 2);

    const created = await request(app.getHttpServer())
      .post(apiPath('/bookings/request'))
      .set(authHeader(customerToken))
      .send({
        items: [
          {
            itemType: 'room',
            referenceId: SEED_ROOM_ID,
            startDate: EMERGENCY_E2E_DATE,
            endDate: addDaysIso(EMERGENCY_E2E_DATE, 1),
            quantity: 1,
          },
        ],
        currency: 'USD',
        preferredPaymentMethod: 'stripe',
      })
      .expect(201);

    bookingId = created.body.bookingId as string;
  }, 120_000);

  afterAll(async () => {
    await app.close();
  });

  it('GET /bookings/:id/emergency-contact returns null when unset', async () => {
    const res = await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}/emergency-contact`))
      .set(authHeader(customerToken))
      .expect(200);

    // Nest/supertest may surface JSON `null` as `{}`.
    const body = res.body;
    const empty =
      body == null ||
      (typeof body === 'object' && !Array.isArray(body) && Object.keys(body).length === 0);
    expect(empty).toBe(true);
  });

  it('PATCH /bookings/:id/emergency-contact sets booking-level contact', async () => {
    const patched = await request(app.getHttpServer())
      .patch(apiPath(`/bookings/${bookingId}/emergency-contact`))
      .set(authHeader(customerToken))
      .send({
        name: 'Paul Urgence',
        phone: '+243900000001',
        email: 'paul@example.com',
        country: 'CD',
        address: 'Kinshasa',
      })
      .expect(200);

    expect(patched.body).toEqual(
      expect.objectContaining({
        name: 'Paul Urgence',
        phone: '+243900000001',
        email: 'paul@example.com',
        country: 'CD',
        address: 'Kinshasa',
      }),
    );

    const got = await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}/emergency-contact`))
      .set(authHeader(customerToken))
      .expect(200);

    expect(got.body).toEqual(
      expect.objectContaining({
        name: 'Paul Urgence',
        phone: '+243900000001',
      }),
    );

    const detail = await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}`))
      .set(authHeader(customerToken))
      .expect(200);

    expect(detail.body.emergencyContact).toEqual(
      expect.objectContaining({
        name: 'Paul Urgence',
        phone: '+243900000001',
        email: 'paul@example.com',
      }),
    );
  });

  it('PATCH /bookings/:id/emergency-contact rejects empty name or phone', async () => {
    await request(app.getHttpServer())
      .patch(apiPath(`/bookings/${bookingId}/emergency-contact`))
      .set(authHeader(customerToken))
      .send({ name: '   ', phone: '+243900000002' })
      .expect(400);

    await request(app.getHttpServer())
      .patch(apiPath(`/bookings/${bookingId}/emergency-contact`))
      .set(authHeader(customerToken))
      .send({ name: 'Alice', phone: '' })
      .expect(400);
  });

  it('forbids another customer from reading or updating emergency contact', async () => {
    await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}/emergency-contact`))
      .set(authHeader(otherCustomerToken))
      .expect(403);

    await request(app.getHttpServer())
      .patch(apiPath(`/bookings/${bookingId}/emergency-contact`))
      .set(authHeader(otherCustomerToken))
      .send({ name: 'Intrus', phone: '+243911111111' })
      .expect(403);
  });

  it('POST manifest-entries ignores deprecated per-traveler emergency fields', async () => {
    const created = await request(app.getHttpServer())
      .post(apiPath(`/bookings/${bookingId}/manifest-entries`))
      .set(authHeader(customerToken))
      .send({
        fullName: 'Marie Dupont',
        nationality: 'CD',
        idNumber: 'P100001',
        emergencyContactName: 'Should Be Ignored',
        emergencyContactPhone: '+243999999999',
        sortOrder: 0,
      })
      .expect(201);

    expect(created.body.fullName).toBe('Marie Dupont');
    expect(created.body.emergencyContactName).toBeNull();
    expect(created.body.emergencyContactPhone).toBeNull();

    const bookingContact = await request(app.getHttpServer())
      .get(apiPath(`/bookings/${bookingId}/emergency-contact`))
      .set(authHeader(customerToken))
      .expect(200);

    expect(bookingContact.body.name).toBe('Paul Urgence');
    expect(bookingContact.body.phone).toBe('+243900000001');
  });

  it('allows staff to PATCH emergency contact', async () => {
    if (!adminToken) {
      return;
    }

    const patched = await request(app.getHttpServer())
      .patch(apiPath(`/bookings/${bookingId}/emergency-contact`))
      .set(authHeader(adminToken))
      .send({
        name: 'Staff Contact',
        phone: '+243900000099',
      })
      .expect(200);

    expect(patched.body).toEqual(
      expect.objectContaining({
        name: 'Staff Contact',
        phone: '+243900000099',
      }),
    );
  });
});

async function ensureRoomAvailability(
  repo: Repository<RoomAvailability>,
  date: string,
  units: number,
): Promise<void> {
  const existing = await repo.findOne({
    where: { roomId: SEED_ROOM_ID, date, deletedAt: IsNull() },
  });
  if (existing) {
    if (existing.availableUnits < units) {
      existing.availableUnits = units;
      await repo.save(existing);
    }
    return;
  }

  await repo.save(
    repo.create({
      id: newId(),
      roomId: SEED_ROOM_ID,
      date,
      availableUnits: units,
      priceCents: 9000,
      createdByUserId: null,
      updatedByUserId: null,
      deletedByUserId: null,
      deletedAt: null,
    }),
  );
}
