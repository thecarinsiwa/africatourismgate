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
import { apiPath, authHeader, loginAsSeedAdmin, loginWithCredentials } from './auth-client';
import { createE2eApp } from './create-app';
import { E2E_OTP_CODE } from './constants';
import { getSeedAdminLogin } from './credentials';
import { UserSessions } from '../../src/entities/generated/users.entity';
import { IsNull } from 'typeorm';
import { SESSION_LOCKED_CODE } from '../../src/modules/auth/auth.constants';

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
        scopeType: 'global',
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

  it('PATCH /users/:id password allows login with assigned password', async () => {
    const email = `password.admin.${randomUUID().slice(0, 8)}@gmail.com`;
    const assignedPassword = 'AssignedPass123!';

    const register = await request(app.getHttpServer())
      .post(apiPath('/auth/register'))
      .send({
        email,
        password: 'InitialPass123!',
        firstName: 'Password',
        lastName: 'Test',
      })
      .expect(201);

    const userId = register.body.user.id as string;
    const { accessToken } = await loginAsSeedAdmin(app);

    await request(app.getHttpServer())
      .patch(apiPath(`/users/${userId}`))
      .set(authHeader(accessToken))
      .send({ status: 'active', password: assignedPassword })
      .expect(200);

    const login = await request(app.getHttpServer())
      .post(apiPath('/auth/login'))
      .send({ email, password: assignedPassword })
      .expect(200);

    expect(login.body.accessToken).toEqual(expect.any(String));
    expect(login.body.user?.email).toBe(email);
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

  describe('Session policy (clientInstanceId, touch, unlock, idle lock)', () => {
    const clientInstanceId = randomUUID();

    function sessionsRepo(app: INestApplication) {
      return app.get<Repository<UserSessions>>(getRepositoryToken(UserSessions));
    }

    it('login with same clientInstanceId revokes the previous refresh token', async () => {
      const credentials = getSeedAdminLogin();
      const first = await loginWithCredentials(app, {
        ...credentials,
        clientInstanceId,
      });

      await loginWithCredentials(app, {
        ...credentials,
        clientInstanceId,
      });

      await request(app.getHttpServer())
        .post(apiPath('/auth/refresh'))
        .send({ refreshToken: first.refreshToken })
        .expect(401);
    });

    it('keeps one active session per user and clientInstanceId', async () => {
      const credentials = getSeedAdminLogin();
      const instance = randomUUID();

      const first = await loginWithCredentials(app, {
        ...credentials,
        clientInstanceId: instance,
      });
      await loginWithCredentials(app, {
        ...credentials,
        clientInstanceId: instance,
      });

      const active = await sessionsRepo(app).find({
        where: {
          userId: first.userId,
          clientInstanceId: instance,
          deletedAt: IsNull(),
        },
      });
      expect(active).toHaveLength(1);
    });

    it('POST /auth/touch updates lastActivityAt', async () => {
      const instance = randomUUID();
      const { refreshToken, userId, clientInstanceId } = await loginAsSeedAdmin(
        app,
        instance,
      );

      const repo = sessionsRepo(app);
      // Cibler la session du login (pas une autre session seed admin plus récente).
      const session = await repo.findOne({
        where: {
          userId,
          clientInstanceId,
          deletedAt: IsNull(),
        },
      });
      expect(session).toBeTruthy();
      expect(session!.id).toBeTruthy();

      const staleMs = Math.floor((Date.now() - 120_000) / 1000) * 1000;
      await repo.manager.query(
        'UPDATE user_sessions SET last_activity_at = FROM_UNIXTIME(?) WHERE id = ?',
        [staleMs / 1000, session!.id],
      );

      const touchedAt = Date.now();
      await request(app.getHttpServer())
        .post(apiPath('/auth/touch'))
        .send({ refreshToken })
        .expect(200);

      const rows = (await repo.manager.query(
        'SELECT UNIX_TIMESTAMP(last_activity_at) AS ts FROM user_sessions WHERE id = ?',
        [session!.id],
      )) as Array<{ ts: number | string | null }>;

      expect(rows[0]?.ts).not.toBeNull();
      const updatedMs = Number(rows[0].ts) * 1000;
      expect(updatedMs).toBeGreaterThan(staleMs);
      expect(updatedMs).toBeGreaterThanOrEqual(
        Math.floor((touchedAt - 5_000) / 1000) * 1000,
      );
    });

    it('POST /auth/refresh returns SESSION_LOCKED after idle timeout', async () => {
      const credentials = getSeedAdminLogin();
      const instance = randomUUID();
      const { refreshToken, userId } = await loginWithCredentials(app, {
        ...credentials,
        clientInstanceId: instance,
      });

      const repo = sessionsRepo(app);
      const session = await repo.findOne({
        where: { userId, clientInstanceId: instance, deletedAt: IsNull() },
      });
      expect(session).toBeTruthy();

      session!.lastActivityAt = new Date(Date.now() - 7_200_000);
      await repo.save(session!);

      const res = await request(app.getHttpServer())
        .post(apiPath('/auth/refresh'))
        .send({ refreshToken })
        .expect(401);

      expect(res.body.code).toBe(SESSION_LOCKED_CODE);
    });

    it('POST /auth/unlock restores session after idle lock', async () => {
      const credentials = getSeedAdminLogin();
      const instance = randomUUID();
      const { refreshToken, userId } = await loginWithCredentials(app, {
        ...credentials,
        clientInstanceId: instance,
      });

      const repo = sessionsRepo(app);
      const session = await repo.findOne({
        where: { userId, clientInstanceId: instance, deletedAt: IsNull() },
      });
      session!.lastActivityAt = new Date(Date.now() - 7_200_000);
      await repo.save(session!);

      const unlock = await request(app.getHttpServer())
        .post(apiPath('/auth/unlock'))
        .send({ password: credentials.password, refreshToken })
        .expect(200);

      expect(unlock.body.accessToken).toEqual(expect.any(String));
      expect(unlock.body.refreshToken).toEqual(expect.any(String));

      await request(app.getHttpServer())
        .post(apiPath('/auth/refresh'))
        .send({ refreshToken: unlock.body.refreshToken })
        .expect(200);
    });

    it('POST /auth/touch rejects idle-locked session', async () => {
      const credentials = getSeedAdminLogin();
      const instance = randomUUID();
      const { refreshToken, userId } = await loginWithCredentials(app, {
        ...credentials,
        clientInstanceId: instance,
      });

      const repo = sessionsRepo(app);
      const session = await repo.findOne({
        where: { userId, clientInstanceId: instance, deletedAt: IsNull() },
      });
      session!.lastActivityAt = new Date(Date.now() - 7_200_000);
      await repo.save(session!);

      const res = await request(app.getHttpServer())
        .post(apiPath('/auth/touch'))
        .send({ refreshToken })
        .expect(401);

      expect(res.body.code).toBe(SESSION_LOCKED_CODE);
    });
  });
});
