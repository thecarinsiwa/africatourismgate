import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DeepPartial, IsNull, Repository } from 'typeorm';
import { Organizations } from '../../entities/generated/organizations.entity';
import { UserRoleAssignments } from '../../entities/generated/rbac.entity';
import {
  PasswordResetTokens,
  Users,
  UserSessions,
} from '../../entities/generated/users.entity';
import { newId } from '../../common/utils/uuid';
import {
  ACCESS_TOKEN_TYPE,
  BCRYPT_ROUNDS,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  REFRESH_TOKEN_TYPE,
  FORGOT_PASSWORD_GENERIC_MESSAGE,
  PASSWORD_RESET_TTL_SECONDS,
  RESET_PASSWORD_INVALID_MESSAGE,
  SEED_ORG_PLATFORM_ID,
  SEED_ROLE_CUSTOMER_ID,
  SEED_ROLE_ORG_ADMIN_ID,
} from './auth.constants';
import {
  AuthResponseDto,
  AuthTokensResponseDto,
} from './dto/auth-tokens-response.dto';
import { toAuthUserDto } from './dto/auth-user.dto';
import {
  AccessJwtPayload,
  RefreshJwtPayload,
} from './interfaces/jwt-payload.interface';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ForgotPasswordResponseDto } from './dto/forgot-password-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthMeDto } from './dto/auth-me.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { PermissionsService } from '../rbac/permissions.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresInSeconds: number;
  private readonly refreshExpiresInSeconds: number;

  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    @InjectRepository(UserSessions)
    private readonly sessionsRepo: Repository<UserSessions>,
    @InjectRepository(Organizations)
    private readonly organizationsRepo: Repository<Organizations>,
    @InjectRepository(UserRoleAssignments)
    private readonly roleAssignmentsRepo: Repository<UserRoleAssignments>,
    @InjectRepository(PasswordResetTokens)
    private readonly passwordResetRepo: Repository<PasswordResetTokens>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly permissionsService: PermissionsService,
  ) {
    this.accessSecret = this.requireSecret('JWT_ACCESS_SECRET');
    this.refreshSecret = this.requireSecret('JWT_REFRESH_SECRET');
    this.accessExpiresInSeconds = expiresInToSeconds(JWT_ACCESS_EXPIRES_IN);
    this.refreshExpiresInSeconds = expiresInToSeconds(JWT_REFRESH_EXPIRES_IN);
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.usersRepo.findOne({
      where: { email, deletedAt: IsNull() },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const defaultOrg = await this.organizationsRepo.findOne({
      where: { id: SEED_ORG_PLATFORM_ID, deletedAt: IsNull() },
    });
    if (!defaultOrg) {
      throw new InternalServerErrorException(
        'Default organization is not configured. Run database seeds.',
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const userId = newId();
    const user = this.usersRepo.create({
      id: userId,
      email,
      passwordHash,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      organizationId: SEED_ORG_PLATFORM_ID,
      ...(dto.phone ? { phone: dto.phone.trim() } : {}),
      ...(dto.preferredLanguage
        ? { preferredLanguage: dto.preferredLanguage.trim() }
        : {}),
      status: 'active',
    } as DeepPartial<Users>);
    await this.usersRepo.save(user);

    const assignment = this.roleAssignmentsRepo.create({
      id: newId(),
      userId,
      roleId: SEED_ROLE_ORG_ADMIN_ID,
      scopeType: 'agency',
      scopeId: SEED_ORG_PLATFORM_ID,
      assignedByUserId: userId,
      assignedAt: new Date(),
    } as DeepPartial<UserRoleAssignments>);
    await this.roleAssignmentsRepo.save(assignment);

    const tokens = await this.issueTokenPair(user);
    return { ...tokens, user: toAuthUserDto(user) };
  }

  async getAuthMe(userId: string): Promise<AuthMeDto> {
    const user = await this.usersRepo.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException();
    }

    const [permissions, isSuperAdmin] = await Promise.all([
      this.permissionsService.getUserPermissionCodes(userId),
      this.permissionsService.hasSuperAdminRole(userId),
    ]);

    return {
      user: toAuthUserDto(user),
      permissions: [...permissions].sort(),
      isSuperAdmin,
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .andWhere('user.deletedAt IS NULL')
      .getOne();

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    user.lastLoginAt = new Date();
    await this.usersRepo.save(user);

    const tokens = await this.issueTokenPair(user);
    return { ...tokens, user: toAuthUserDto(user) };
  }

  async loginWithGoogleProfile(profile: {
    emails?: Array<{ value?: string }>;
    name?: { givenName?: string; familyName?: string };
  }): Promise<AuthResponseDto> {
    const email = profile.emails?.[0]?.value?.trim().toLowerCase();
    if (!email) {
      throw new UnauthorizedException('Google account has no email');
    }

    let user = await this.usersRepo.findOne({
      where: { email, deletedAt: IsNull() },
    });

    if (!user) {
      const defaultOrg = await this.organizationsRepo.findOne({
        where: { id: SEED_ORG_PLATFORM_ID, deletedAt: IsNull() },
      });
      if (!defaultOrg) {
        throw new InternalServerErrorException(
          'Default organization is not configured. Run database seeds.',
        );
      }

      const generatedPassword = randomBytes(24).toString('hex');
      user = this.usersRepo.create({
        id: newId(),
        email,
        passwordHash: await bcrypt.hash(generatedPassword, BCRYPT_ROUNDS),
        firstName: profile.name?.givenName?.trim() || 'Google',
        lastName: profile.name?.familyName?.trim() || 'User',
        organizationId: SEED_ORG_PLATFORM_ID,
        status: 'active',
      } as DeepPartial<Users>);
      await this.usersRepo.save(user);

      const assignment = this.roleAssignmentsRepo.create({
        id: newId(),
        userId: user.id,
        roleId: SEED_ROLE_CUSTOMER_ID,
        scopeType: 'global',
        assignedByUserId: user.id,
        assignedAt: new Date(),
      } as DeepPartial<UserRoleAssignments>);
      await this.roleAssignmentsRepo.save(assignment);
    }

    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    user.lastLoginAt = new Date();
    await this.usersRepo.save(user);

    const tokens = await this.issueTokenPair(user);
    return { ...tokens, user: toAuthUserDto(user) };
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<AuthUserDto> {
    const user = await this.usersRepo.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException();
    }

    if (dto.firstName !== undefined) {
      user.firstName = dto.firstName.trim();
    }
    if (dto.lastName !== undefined) {
      user.lastName = dto.lastName.trim();
    }
    if (dto.phone !== undefined) {
      user.phone = dto.phone?.trim() ?? '';
    }
    if (dto.preferredLanguage !== undefined) {
      user.preferredLanguage = dto.preferredLanguage?.trim() ?? '';
    }

    await this.usersRepo.save(user);
    return toAuthUserDto(user);
  }

  buildWebOAuthCallbackUrl(
    next: string | undefined,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
  ): string {
    const defaultWebUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://africatourismgate.org'
        : 'http://localhost:3002';
    const webUrl = (process.env.NEXT_PUBLIC_WEB_URL ?? defaultWebUrl).replace(/\/$/, '');
    const safeNext = normalizeNextPath(next);
    const query = new URLSearchParams({
      accessToken,
      refreshToken,
      expiresIn: String(expiresIn),
      next: safeNext,
    });
    return `${webUrl}/booking/oauth/callback?${query.toString()}`;
  }

  async refresh(refreshToken: string): Promise<AuthTokensResponseDto> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const session = await this.sessionsRepo.findOne({
      where: {
        id: payload.sid,
        userId: payload.sub,
        deletedAt: IsNull(),
      },
    });

    if (!session || session.expiresAt <= new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const matches = await bcrypt.compare(
      refreshToken,
      session.refreshTokenHash,
    );
    if (!matches) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.usersRepo.findOne({
      where: { id: payload.sub, deletedAt: IsNull() },
    });
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    return this.rotateSessionTokens(user, session);
  }

  async logout(refreshToken: string): Promise<{ success: true }> {
    try {
      const payload = await this.verifyRefreshToken(refreshToken);
      const session = await this.sessionsRepo.findOne({
        where: {
          id: payload.sid,
          userId: payload.sub,
          deletedAt: IsNull(),
        },
      });

      if (session) {
        const matches = await bcrypt.compare(
          refreshToken,
          session.refreshTokenHash,
        );
        if (matches) {
          await this.sessionsRepo.softRemove(session);
        }
      }
    } catch {
      // Idempotent logout: invalid token still returns success
    }

    return { success: true };
  }

  async forgotPassword(
    dto: ForgotPasswordDto,
  ): Promise<ForgotPasswordResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersRepo.findOne({
      where: { email, deletedAt: IsNull(), status: 'active' },
    });

    if (user) {
      const rawToken = randomBytes(32).toString('hex');
      const tokenHash = hashResetToken(rawToken);

      await this.passwordResetRepo.update(
        { userId: user.id, usedAt: IsNull() },
        { usedAt: new Date() },
      );

      const resetRow = this.passwordResetRepo.create({
        id: newId(),
        userId: user.id,
        tokenHash,
        expiresAt: new Date(
          Date.now() + PASSWORD_RESET_TTL_SECONDS * 1000,
        ),
        usedAt: null,
        createdAt: new Date(),
      });
      await this.passwordResetRepo.save(resetRow);

      if (process.env.NODE_ENV !== 'production') {
        const baseUrl = this.getResetPasswordBaseUrl();
        this.logger.log(
          `Password reset link: ${baseUrl}?token=${rawToken}`,
        );
      }
    }

    return { message: FORGOT_PASSWORD_GENERIC_MESSAGE };
  }

  async resetPassword(
    dto: ResetPasswordDto,
  ): Promise<{ success: true }> {
    const tokenHash = hashResetToken(dto.token.trim());
    const resetRow = await this.passwordResetRepo.findOne({
      where: { tokenHash, usedAt: IsNull() },
    });

    if (!resetRow || resetRow.expiresAt <= new Date()) {
      throw new BadRequestException(RESET_PASSWORD_INVALID_MESSAGE);
    }

    const user = await this.usersRepo
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.id = :id', { id: resetRow.userId })
      .andWhere('user.deletedAt IS NULL')
      .getOne();

    if (!user || user.status !== 'active') {
      throw new BadRequestException(RESET_PASSWORD_INVALID_MESSAGE);
    }

    user.passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    await this.usersRepo.save(user);

    resetRow.usedAt = new Date();
    await this.passwordResetRepo.save(resetRow);

    await this.revokeAllUserSessions(user.id);

    return { success: true };
  }

  private getResetPasswordBaseUrl(): string {
    const configured = this.config.get<string>('ADMIN_RESET_PASSWORD_URL');
    if (configured?.trim()) {
      return configured.trim().replace(/\/$/, '');
    }
    const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL?.replace(/\/$/, '');
    return adminUrl ? `${adminUrl}/reset-password` : 'http://localhost:3001/reset-password';
  }

  private async revokeAllUserSessions(userId: string): Promise<void> {
    const sessions = await this.sessionsRepo.find({
      where: { userId, deletedAt: IsNull() },
    });
    for (const session of sessions) {
      await this.sessionsRepo.softRemove(session);
    }
  }

  private async issueTokenPair(user: Users): Promise<AuthTokensResponseDto> {
    const session = this.sessionsRepo.create({
      id: newId(),
      userId: user.id,
      refreshTokenHash: '',
      expiresAt: new Date(
        Date.now() + this.refreshExpiresInSeconds * 1000,
      ),
    } as DeepPartial<UserSessions>);
    await this.sessionsRepo.save(session);
    return this.rotateSessionTokens(user, session);
  }

  private async rotateSessionTokens(
    user: Users,
    session: UserSessions,
  ): Promise<AuthTokensResponseDto> {
    const refreshToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        sid: session.id,
        type: REFRESH_TOKEN_TYPE,
      } satisfies RefreshJwtPayload,
      {
        secret: this.refreshSecret,
        expiresIn: this.refreshExpiresInSeconds,
      },
    );

    session.refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    session.expiresAt = new Date(
      Date.now() + this.refreshExpiresInSeconds * 1000,
    );
    await this.sessionsRepo.save(session);

    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        type: ACCESS_TOKEN_TYPE,
      } satisfies AccessJwtPayload,
      {
        secret: this.accessSecret,
        expiresIn: this.accessExpiresInSeconds,
      },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: this.accessExpiresInSeconds,
    };
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<RefreshJwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshJwtPayload>(
        refreshToken,
        { secret: this.refreshSecret },
      );
      if (payload.type !== REFRESH_TOKEN_TYPE || !payload.sid || !payload.sub) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  private requireSecret(key: string): string {
    const value = this.config.get<string>(key);
    if (!value?.trim()) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }
}

function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

function expiresInToSeconds(value: string): number {
  const trimmed = value.trim();
  const match = /^(\d+)([smhd])?$/i.exec(trimmed);
  if (!match) {
    return 900;
  }
  const amount = Number(match[1]);
  const unit = (match[2] ?? 's').toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };
  return amount * (multipliers[unit] ?? 1);
}

function normalizeNextPath(next: string | undefined): string {
  if (!next) return '/booking/cart';
  if (!next.startsWith('/')) return '/booking/cart';
  if (next.startsWith('//')) return '/booking/cart';
  return next;
}
