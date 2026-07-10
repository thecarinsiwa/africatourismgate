import type { INestApplication } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import request from 'supertest';
import { randomUUID } from 'node:crypto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from '../../src/modules/auth/auth.service';
import { EmailService } from '../../src/modules/email/email.service';
import { EmailVerificationService } from '../../src/modules/email-verification/email-verification.service';
import { UserRoleAssignments } from '../../src/entities/generated/rbac.entity';
import { apiPath, authHeader, loginAsSeedAdmin } from './auth-client';
import { createE2eApp } from './create-app';
import { E2E_OTP_CODE } from './constants';
import { getSeedAdminLogin } from './credentials';

describe('Auth (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createE2eApp();
  }, 120_000);

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/register creates suspended Gmail user without role', async () => {
    const email = `pending.admin.${randomUUID().slice(0, 8)}@gmail.com`;
    const password = 'SecurePass123!';

    const res = await request(app.getHttpServer())
      .post(apiPath('/auth/register'))
      .send({
        email,
        password,
        firstName: 'Pending',
        lastName: 'Admin',
      })
      .expect(201);

    expect(res.body.pendingApproval).toBe(true);
    expect(res.body.accessToken).toBe('');
    expect(res.body.user?.status).toBe('suspended');
    expect(res.body.user?.email).toBe(email);

    const roleAssignments = app.get<Repository<UserRoleAssignments>>(
      getRepositoryToken(UserRoleAssignments),
    );
    const assignments = await roleAssignments.find({
      where: { userId: res.body.user.id },
    });
    expect(assignments).toHaveLength(0);

    await request(app.getHttpServer())
      .post(apiPath('/auth/login'))
      .send({ email, password })
      .expect(401);
  });

  it('POST /auth/register rejects non-Gmail email', async () => {
    await request(app.getHttpServer())
      .post(apiPath('/auth/register'))
      .send({
        email: `not.gmail.${randomUUID().slice(0, 8)}@outlook.com`,
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
      })
      .expect(400);
  });

  it('registerAdminWithGoogleProfile creates suspended user pending approval', async () => {
    const authService = app.get(AuthService);
    const email = `google.admin.${randomUUID().slice(0, 8)}@gmail.com`;

    const res = await authService.registerAdminWithGoogleProfile({
      emails: [{ value: email }],
      name: { givenName: 'Google', familyName: 'Pending' },
    });

    expect(res.pendingApproval).toBe(true);
    expect(res.user?.status).toBe('suspended');
    expect(res.accessToken).toBe('');
  });

  it('registerAdminWithGoogleProfile rejects non-Gmail email', async () => {
    const authService = app.get(AuthService);

    await expect(
      authService.registerAdminWithGoogleProfile({
        emails: [{ value: 'user@company.com' }],
        name: { givenName: 'Work', familyName: 'User' },
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('PATCH /users/:id to active sends activation email for suspended account', async () => {
    const email = `activate.admin.${randomUUID().slice(0, 8)}@gmail.com`;
    const register = await request(app.getHttpServer())
      .post(apiPath('/auth/register'))
      .send({
        email,
        password: 'SecurePass123!',
        firstName: 'Activate',
        lastName: 'Me',
        preferredLanguage: 'en',
      })
      .expect(201);

    const userId = register.body.user.id as string;
    const { accessToken } = await loginAsSeedAdmin(app);

    await request(app.getHttpServer())
      .post(apiPath('/user-role-assignments'))
      .set(authHeader(accessToken))
      .send({
        userId,
        roleId: '00000000-0000-4000-8000-000000000101',
        scopeType: 'agency',
        scopeId: '00000000-0000-4000-8000-000000000001',
      })
      .expect(201);

    const emailService = app.get(EmailService);
    const sendSpy = jest
      .spyOn(emailService, 'sendAdminAccountActivated')
      .mockResolvedValue({ sent: true });

    await request(app.getHttpServer())
      .patch(apiPath(`/users/${userId}`))
      .set(authHeader(accessToken))
      .send({ status: 'active' })
      .expect(200);

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        to: email,
        firstName: 'Activate',
        locale: 'en',
        roles: ['Organization administrator'],
        loginUrl: expect.stringContaining('/login'),
      }),
    );

    sendSpy.mockRestore();
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

  it('Google login for existing user requires OTP then returns tokens', async () => {
    const credentials = getSeedAdminLogin();
    const authService = app.get(AuthService);

    const pending = await authService.loginWithGoogleProfile({
      emails: [{ value: credentials.email }],
      name: { givenName: 'Admin', familyName: 'Google' },
    });

    expect(pending.requiresVerification).toBe(true);
    expect(pending.verificationId).toEqual(expect.any(String));
    expect(pending.verificationPurpose).toBe('login');
    expect(pending.accessToken).toBe('');

    const verify = await request(app.getHttpServer())
      .post(apiPath('/auth/verify-operation'))
      .send({
        verificationId: pending.verificationId,
        code: E2E_OTP_CODE,
      })
      .expect(200);

    expect(verify.body.accessToken).toEqual(expect.any(String));
    expect(verify.body.refreshToken).toEqual(expect.any(String));
    expect(verify.body.user?.email).toBe(credentials.email);
  });

  it('google_signup OTP logs in when the email already has an account', async () => {
    const credentials = getSeedAdminLogin();
    const emailVerification = app.get(EmailVerificationService);

    const { verificationId } = await emailVerification.createAndSend({
      email: credentials.email,
      purpose: 'google_signup',
      referenceId: randomUUID(),
      firstName: 'Admin',
      metadata: {
        firstName: 'Admin',
        lastName: 'Google',
        email: credentials.email,
      },
    });

    const verify = await request(app.getHttpServer())
      .post(apiPath('/auth/verify-operation'))
      .send({
        verificationId,
        code: E2E_OTP_CODE,
      })
      .expect(200);

    expect(verify.body.accessToken).toEqual(expect.any(String));
    expect(verify.body.user?.email).toBe(credentials.email);
  });

  it('google_signup OTP double submission still returns tokens', async () => {
    const credentials = getSeedAdminLogin();
    const emailVerification = app.get(EmailVerificationService);

    const { verificationId } = await emailVerification.createAndSend({
      email: credentials.email,
      purpose: 'google_signup',
      referenceId: randomUUID(),
      firstName: 'Admin',
      metadata: {
        firstName: 'Admin',
        lastName: 'Google',
        email: credentials.email,
      },
    });

    const payload = { verificationId, code: E2E_OTP_CODE };

    const first = await request(app.getHttpServer())
      .post(apiPath('/auth/verify-operation'))
      .send(payload)
      .expect(200);

    const second = await request(app.getHttpServer())
      .post(apiPath('/auth/verify-operation'))
      .send(payload)
      .expect(200);

    expect(first.body.accessToken).toEqual(expect.any(String));
    expect(second.body.accessToken).toEqual(expect.any(String));
    expect(second.body.user?.email).toBe(credentials.email);
  });

  it('buildWebVerificationUrl includes purpose for Google login OTP', async () => {
    const credentials = getSeedAdminLogin();
    const authService = app.get(AuthService);

    const pending = await authService.loginWithGoogleProfile({
      emails: [{ value: credentials.email }],
      name: { givenName: 'Admin', familyName: 'Google' },
    });

    const url = authService.buildWebVerificationUrl(
      pending.verificationId!,
      '/account',
      'http://localhost:3002',
      pending.verificationPurpose,
    );

    expect(url).toContain('purpose=login');
    expect(url).toContain('verificationId=');
    expect(url).toContain('next=%2Faccount');
  });
});
