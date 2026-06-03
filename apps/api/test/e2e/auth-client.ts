import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { API_PREFIX } from './constants';
import { getSeedAdminLogin } from './credentials';

export function apiPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/${API_PREFIX}${normalized}`;
}

export async function loginAsSeedAdmin(
  app: INestApplication,
): Promise<{ accessToken: string; refreshToken: string }> {
  const credentials = getSeedAdminLogin();
  const res = await request(app.getHttpServer())
    .post(apiPath('/auth/login'))
    .send(credentials)
    .expect(200);

  const { accessToken, refreshToken } = res.body;
  if (!accessToken || !refreshToken) {
    throw new Error('Login response missing tokens');
  }
  return { accessToken, refreshToken };
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
