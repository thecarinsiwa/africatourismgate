import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { apiPath } from './auth-client';
import { createE2eApp } from './create-app';

describe('GET /health (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createE2eApp();
  }, 120_000);

  afterAll(async () => {
    await app.close();
  });

  it('returns ok status without authentication', async () => {
    const res = await request(app.getHttpServer()).get(apiPath('/health')).expect(200);

    expect(res.body).toEqual({
      status: 'ok',
      service: 'africatourismgate-api',
    });
  });
});
