import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { apiPath, authHeader, loginAsSeedAdmin } from './auth-client';
import { createE2eApp } from './create-app';
import { getSeedAdminLogin } from './credentials';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createE2eApp();
  }, 120_000);

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login returns tokens for seed admin', async () => {
    const credentials = getSeedAdminLogin();
    const res = await request(app.getHttpServer())
      .post(apiPath('/auth/login'))
      .send(credentials)
      .expect(200);

    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.refreshToken).toEqual(expect.any(String));
    expect(res.body.user?.email).toBe(credentials.email);
  });

  it('POST /auth/refresh returns token pair', async () => {
    const { refreshToken } = await loginAsSeedAdmin(app);

    const res = await request(app.getHttpServer())
      .post(apiPath('/auth/refresh'))
      .send({ refreshToken })
      .expect(200);

    expect(res.body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
      expiresIn: expect.any(Number),
    });
  });

  it('GET /auth/me returns 401 without bearer token', async () => {
    await request(app.getHttpServer()).get(apiPath('/auth/me')).expect(401);
  });

  it('GET /auth/me returns profile with valid token', async () => {
    const { accessToken } = await loginAsSeedAdmin(app);

    const res = await request(app.getHttpServer())
      .get(apiPath('/auth/me'))
      .set(authHeader(accessToken))
      .expect(200);

    expect(res.body.user?.email).toBe(getSeedAdminLogin().email);
    expect(Array.isArray(res.body.permissions)).toBe(true);
  });
});
