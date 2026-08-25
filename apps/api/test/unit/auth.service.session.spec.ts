import { UnauthorizedException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { Organizations } from '../../src/entities/generated/organizations.entity';
import { UserRoleAssignments } from '../../src/entities/generated/rbac.entity';
import {
  PasswordResetTokens,
  Users,
  UserSessions,
} from '../../src/entities/generated/users.entity';
import {
  REFRESH_TOKEN_TYPE,
  SESSION_LOCKED_CODE,
} from '../../src/modules/auth/auth.constants';
import { AuthService } from '../../src/modules/auth/auth.service';
import { RefreshJwtPayload } from '../../src/modules/auth/interfaces/jwt-payload.interface';
import { PermissionsService } from '../../src/modules/rbac/permissions.service';
import { EmailService } from '../../src/modules/email/email.service';
import { EmailVerificationService } from '../../src/modules/email-verification/email-verification.service';
import { BookingEngineService } from '../../src/modules/resources/bookings/booking-engine.service';

const USER_ID = '00000000-0000-4000-8000-000000000099';
const SESSION_ID = '00000000-0000-4000-8000-000000000088';
const PASSWORD = 'ChangeMe123!';

function emptyRepoMock() {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(async (entity) => entity),
    create: jest.fn((entity) => entity),
    softRemove: jest.fn(async (entity) => entity),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
}

describe('AuthService session policy (unit)', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let sessionsRepo: jest.Mocked<Repository<UserSessions>>;
  let usersRepo: jest.Mocked<Repository<Users>>;

  beforeEach(async () => {
    sessionsRepo = emptyRepoMock() as jest.Mocked<Repository<UserSessions>>;
    usersRepo = emptyRepoMock() as jest.Mocked<Repository<Users>>;

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), JwtModule.register({})],
      providers: [
        AuthService,
        { provide: getRepositoryToken(Users), useValue: usersRepo },
        { provide: getRepositoryToken(UserSessions), useValue: sessionsRepo },
        {
          provide: getRepositoryToken(Organizations),
          useValue: emptyRepoMock(),
        },
        {
          provide: getRepositoryToken(UserRoleAssignments),
          useValue: emptyRepoMock(),
        },
        {
          provide: getRepositoryToken(PasswordResetTokens),
          useValue: emptyRepoMock(),
        },
        {
          provide: PermissionsService,
          useValue: { getPermissionsForUser: jest.fn() },
        },
        { provide: EmailService, useValue: {} },
        { provide: EmailVerificationService, useValue: {} },
        { provide: BookingEngineService, useValue: {} },
      ],
    }).compile();

    service = module.get(AuthService);
    jwtService = module.get(JwtService);
  });

  async function signRefreshToken(): Promise<string> {
    return jwtService.signAsync(
      {
        sub: USER_ID,
        sid: SESSION_ID,
        type: REFRESH_TOKEN_TYPE,
      } satisfies RefreshJwtPayload,
      {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: 3600,
      },
    );
  }

  async function mockActiveSession(
    refreshToken: string,
    lastActivityAt: Date,
  ): Promise<UserSessions> {
    const session = {
      id: SESSION_ID,
      userId: USER_ID,
      clientInstanceId: 'browser-a',
      refreshTokenHash: await bcrypt.hash(refreshToken, 10),
      expiresAt: new Date(Date.now() + 86_400_000),
      lastActivityAt,
      deletedAt: null,
    } as UserSessions;

    sessionsRepo.findOne.mockResolvedValue(session);
    usersRepo.findOne.mockResolvedValue({
      id: USER_ID,
      email: 'user@example.com',
      status: 'active',
    } as Users);

    return session;
  }

  it('refresh rejects idle-locked session with SESSION_LOCKED code', async () => {
    const refreshToken = await signRefreshToken();
    await mockActiveSession(
      refreshToken,
      new Date(Date.now() - 7_200_000),
    );

    await expect(service.refresh(refreshToken)).rejects.toMatchObject({
      response: expect.objectContaining({ code: SESSION_LOCKED_CODE }),
    });
  });

  it('touchSession updates lastActivityAt when session is active', async () => {
    const refreshToken = await signRefreshToken();
    const session = await mockActiveSession(refreshToken, new Date());

    const before = session.lastActivityAt?.getTime() ?? 0;
    await service.touchSession(refreshToken);

    expect(sessionsRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: SESSION_ID,
        lastActivityAt: expect.any(Date),
      }),
    );
    const saved = sessionsRepo.save.mock.calls.at(-1)?.[0] as UserSessions;
    expect(saved.lastActivityAt!.getTime()).toBeGreaterThanOrEqual(before);
  });

  it('touchSession rejects idle-locked session', async () => {
    const refreshToken = await signRefreshToken();
    await mockActiveSession(
      refreshToken,
      new Date(Date.now() - 7_200_000),
    );

    await expect(service.touchSession(refreshToken)).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });

  it('unlockSession verifies password, resets activity and rotates tokens', async () => {
    const refreshToken = await signRefreshToken();
    await mockActiveSession(
      refreshToken,
      new Date(Date.now() - 7_200_000),
    );

    const passwordHash = await bcrypt.hash(PASSWORD, 10);
    const queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id: USER_ID,
        passwordHash,
      }),
    };
    usersRepo.createQueryBuilder.mockReturnValue(queryBuilder as never);

    const tokens = await service.unlockSession(PASSWORD, refreshToken);

    expect(tokens.accessToken).toEqual(expect.any(String));
    expect(tokens.refreshToken).toEqual(expect.any(String));
    expect(sessionsRepo.save).toHaveBeenCalled();
  });

  it('unlockSession rejects invalid password', async () => {
    const refreshToken = await signRefreshToken();
    await mockActiveSession(
      refreshToken,
      new Date(Date.now() - 7_200_000),
    );

    const queryBuilder = {
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({
        id: USER_ID,
        passwordHash: await bcrypt.hash('other-password', 10),
      }),
    };
    usersRepo.createQueryBuilder.mockReturnValue(queryBuilder as never);

    await expect(
      service.unlockSession(PASSWORD, refreshToken),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
