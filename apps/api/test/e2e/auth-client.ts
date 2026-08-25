import type { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { API_PREFIX, E2E_OTP_CODE } from './constants';
import { getSeedAdminLogin } from './credentials';

export const E2E_CLIENT_INSTANCE_ID = '00000000-0000-4000-8000-000000000701';

export type LoginOptions = {
  email: string;
  password: string;
  clientInstanceId?: string;
};

export function apiPath(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `/${API_PREFIX}${normalized}`;
}

export async function loginWithCredentials(
  app: INestApplication,
  options: LoginOptions,
): Promise<{
  accessToken: string;
  refreshToken: string;
  userId: string;
}> {
  const res = await request(app.getHttpServer())
    .post(apiPath('/auth/login'))
    .send(options)
    .expect(200);

  const { accessToken, refreshToken, user } = res.body;
  if (!accessToken || !refreshToken || !user?.id) {
    throw new Error('Login response missing tokens or user id');
  }
  return { accessToken, refreshToken, userId: user.id as string };
}

export async function loginAsSeedAdmin(
  app: INestApplication,
  clientInstanceId = randomUUID(),
): Promise<{
  accessToken: string;
  refreshToken: string;
  userId: string;
  clientInstanceId: string;
}> {
  const credentials = getSeedAdminLogin();
  const login = await loginWithCredentials(app, {
    ...credentials,
    clientInstanceId,
  });
  return { ...login, clientInstanceId };
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

export type RegisterCustomerParams = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
};

/** Register a customer via OTP flow and return an access token. */
export async function registerAndLoginCustomer(
  app: INestApplication,
  params: RegisterCustomerParams,
): Promise<string> {
  const reg = await request(app.getHttpServer())
    .post(apiPath('/auth/register/customer'))
    .send(params)
    .expect(201);

  if (reg.body.requiresVerification && reg.body.verificationId) {
    const verify = await request(app.getHttpServer())
      .post(apiPath('/auth/verify-operation'))
      .send({
        verificationId: reg.body.verificationId,
        code: E2E_OTP_CODE,
      })
      .expect(200);

    const accessToken = verify.body.accessToken as string | undefined;
    if (!accessToken) {
      throw new Error('Verify response missing accessToken');
    }
    return accessToken;
  }

  const login = await request(app.getHttpServer())
    .post(apiPath('/auth/login'))
    .send({ email: params.email, password: params.password })
    .expect(200);

  const accessToken = login.body.accessToken as string | undefined;
  if (!accessToken) {
    throw new Error('Login response missing accessToken');
  }
  return accessToken;
}
