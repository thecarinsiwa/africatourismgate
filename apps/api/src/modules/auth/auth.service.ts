import { createHash, randomBytes } from 'node:crypto';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DeepPartial, IsNull, QueryFailedError, Repository } from 'typeorm';
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
  EMAIL_ALREADY_REGISTERED_MESSAGE,
  GMAIL_ONLY_MESSAGE,
  SEED_ORG_PLATFORM_ID,
  SEED_ROLE_CUSTOMER_ID,
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
import { extractGoogleProfileEmail } from './google-profile.utils';
import { isGmailAddress } from './gmail.utils';
import { resolveOAuthWebUrlFromNext } from './resolve-web-origin.util';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ForgotPasswordResponseDto } from './dto/forgot-password-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthMeDto } from './dto/auth-me.dto';
import {
  AuthOrganizationDto,
  toAuthOrganizationDto,
} from './dto/auth-organization.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuthUserDto } from './dto/auth-user.dto';
import { PermissionsService } from '../rbac/permissions.service';
import { EmailService } from '../email/email.service';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { BookingEngineService } from '../resources/bookings/booking-engine.service';
import { VerifyOperationDto } from './dto/verify-operation.dto';
import { EmailOperationVerifications } from '../../entities/email-operation-verification.entity';
import type { EmailOperationPurpose } from '../../entities/email-operation-verification.entity';

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
    private readonly emailService: EmailService,
    private readonly emailVerification: EmailVerificationService,
    @Inject(forwardRef(() => BookingEngineService))
    private readonly bookingEngine: BookingEngineService,
  ) {
    this.accessSecret = this.requireSecret('JWT_ACCESS_SECRET');
    this.refreshSecret = this.requireSecret('JWT_REFRESH_SECRET');
    this.accessExpiresInSeconds = expiresInToSeconds(JWT_ACCESS_EXPIRES_IN);
    this.refreshExpiresInSeconds = expiresInToSeconds(JWT_REFRESH_EXPIRES_IN);
  }

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const email = dto.email.trim().toLowerCase();
    this.assertGmailEmail(email);

    const existing = await this.findAnyUserByEmail(email);
    if (existing && !existing.deletedAt) {
      if (existing.status === 'active') {
        throw new ConflictException(EMAIL_ALREADY_REGISTERED_MESSAGE);
      }
      return this.pendingApprovalResponse(existing);
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = await this.createPendingAdminUser({
      email,
      passwordHash,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      ...(dto.phone ? { phone: dto.phone.trim() } : {}),
      ...(dto.preferredLanguage
        ? { preferredLanguage: dto.preferredLanguage.trim() }
        : {}),
    });

    void this.notifySuperAdminsOfPendingRegistration(user);
    return this.pendingApprovalResponse(user);
  }

  async registerCustomer(dto: RegisterDto): Promise<AuthResponseDto> {
    return this.registerWithRole(
      dto,
      {
        roleId: SEED_ROLE_CUSTOMER_ID,
        scopeType: 'global',
      },
      { deferUserCreation: true },
    );
  }

  private async registerWithRole(
    dto: RegisterDto,
    role: {
      roleId: string;
      scopeType: 'global' | 'agency';
      scopeId?: string;
    },
    options?: { deferUserCreation?: boolean },
  ): Promise<AuthResponseDto> {
    const email = dto.email.trim().toLowerCase();
    const existing = await this.usersRepo.findOne({
      where: { email },
    });
    if (existing) {
      throw new ConflictException(EMAIL_ALREADY_REGISTERED_MESSAGE);
    }

    if (options?.deferUserCreation) {
      const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
      const pendingId = newId();
      const { verificationId } = await this.emailVerification.createAndSend({
        email,
        purpose: 'register',
        referenceId: pendingId,
        firstName: dto.firstName.trim(),
        metadata: {
          lastName: dto.lastName.trim(),
          passwordHash,
          roleId: role.roleId,
          scopeType: role.scopeType,
          ...(role.scopeId ? { scopeId: role.scopeId } : {}),
          ...(dto.phone ? { phone: dto.phone.trim() } : {}),
          ...(dto.preferredLanguage
            ? { preferredLanguage: dto.preferredLanguage.trim() }
            : {}),
        },
      });
      return this.pendingVerificationResponse(verificationId, 'register');
    }

    await this.ensurePlatformOrg();

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

    try {
      await this.usersRepo.save(user);

      const assignment = this.roleAssignmentsRepo.create({
        id: newId(),
        userId,
        roleId: role.roleId,
        scopeType: role.scopeType,
        ...(role.scopeId ? { scopeId: role.scopeId } : {}),
        assignedByUserId: userId,
        assignedAt: new Date(),
      } as DeepPartial<UserRoleAssignments>);
      await this.roleAssignmentsRepo.save(assignment);
    } catch (error) {
      if (this.isDuplicateEmailError(error)) {
        throw new ConflictException(EMAIL_ALREADY_REGISTERED_MESSAGE);
      }
      throw error;
    }
    const { verificationId } = await this.emailVerification.createAndSend({
      email: user.email,
      purpose: 'register',
      referenceId: user.id,
      firstName: user.firstName,
    });

    const tokens = await this.issueTokenPair(user);
    void this.notifyWelcome(user);

    return {
      ...tokens,
      user: toAuthUserDto(user),
      verificationId,
    };
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

  async listMyOrganizations(userId: string): Promise<AuthOrganizationDto[]> {
    const user = await this.usersRepo.findOne({
      where: { id: userId, deletedAt: IsNull() },
    });
    if (!user || user.status !== 'active') {
      throw new UnauthorizedException();
    }

    const [isSuperAdmin, canListAll] = await Promise.all([
      this.permissionsService.hasSuperAdminRole(userId),
      this.permissionsService.hasAnyPermission(userId, ['organizations.read']),
    ]);

    if (isSuperAdmin || canListAll) {
      const organizations = await this.organizationsRepo.find({
        where: { deletedAt: IsNull(), status: 'active' },
        order: { name: 'ASC' },
      });
      return organizations.map(toAuthOrganizationDto);
    }

    if (user.organizationId) {
      const organization = await this.organizationsRepo.findOne({
        where: {
          id: user.organizationId,
          deletedAt: IsNull(),
          status: 'active',
        },
      });
      return organization ? [toAuthOrganizationDto(organization)] : [];
    }

    return [];
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

  async registerAdminWithGoogleProfile(profile: {
    emails?: Array<{ value?: string }>;
    name?: { givenName?: string; familyName?: string };
    _json?: { email?: string };
  }): Promise<AuthResponseDto> {
    const email = extractGoogleProfileEmail(profile);
    if (!email) {
      throw new UnauthorizedException('Google account has no email');
    }
    this.assertGmailEmail(email);

    const existing = await this.findAnyUserByEmail(email);
    if (existing && !existing.deletedAt) {
      if (existing.status === 'active') {
        throw new ConflictException(EMAIL_ALREADY_REGISTERED_MESSAGE);
      }
      return this.pendingApprovalResponse(existing);
    }

    const firstName = profile.name?.givenName?.trim() || 'Google';
    const lastName = profile.name?.familyName?.trim() || 'User';
    const passwordHash = await bcrypt.hash(
      randomBytes(24).toString('hex'),
      BCRYPT_ROUNDS,
    );
    const user = await this.createPendingAdminUser({
      email,
      passwordHash,
      firstName,
      lastName,
    });

    void this.notifySuperAdminsOfPendingRegistration(user);
    return this.pendingApprovalResponse(user);
  }

  async loginWithGoogleProfile(profile: {
    emails?: Array<{ value?: string }>;
    name?: { givenName?: string; familyName?: string };
    _json?: { email?: string };
  }): Promise<AuthResponseDto> {
    const email = extractGoogleProfileEmail(profile);
    if (!email) {
      throw new UnauthorizedException('Google account has no email');
    }

    const activeUser = await this.findActiveCustomerByEmail(email);
    if (activeUser) {
      return this.startGoogleLoginVerification(activeUser);
    }

    const taken = await this.findAnyUserByEmail(email);
    if (taken && !taken.deletedAt && taken.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    const firstName = profile.name?.givenName?.trim() || 'Google';
    const lastName = profile.name?.familyName?.trim() || 'User';
    const pendingId = newId();
    try {
      const { verificationId } = await this.emailVerification.createAndSend({
        email,
        purpose: 'google_signup',
        referenceId: pendingId,
        firstName,
        metadata: { firstName, lastName, email },
      });
      return this.pendingVerificationResponse(verificationId, 'google_signup');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Google signup verification could not be created for ${email}: ${message}`,
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Google signup could not be started',
      );
    }
  }

  async verifyOperation(dto: VerifyOperationDto): Promise<AuthResponseDto> {
    const row = await this.emailVerification.verifyCode(
      dto.verificationId,
      dto.code,
    );

    if (row.purpose === 'booking') {
      await this.bookingEngine.activateDraftBooking(row.referenceId);
      const booking = await this.bookingEngine.getBookingDetail(row.referenceId);
      const user = await this.usersRepo.findOne({
        where: { id: booking.booking.userId, deletedAt: IsNull() },
      });
      if (!user) {
        throw new BadRequestException('Compte introuvable pour cette réservation.');
      }
      const tokens = await this.issueTokenPair(user);
      return {
        ...tokens,
        user: toAuthUserDto(user),
        bookingId: row.referenceId,
      };
    }

    if (row.purpose === 'google_signup') {
      return this.completeGoogleOAuthVerification(row);
    }

    if (row.purpose === 'register') {
      let user = await this.usersRepo.findOne({
        where: { id: row.referenceId, deletedAt: IsNull() },
      });
      let isNewAccount = false;
      if (!user) {
        try {
          user = await this.createUserFromRegisterRow(row);
          isNewAccount = true;
        } catch (err) {
          if (err instanceof ConflictException) {
            user = await this.findActiveCustomerByEmail(row.email);
            if (!user) {
              throw err;
            }
          } else {
            throw err;
          }
        }
      } else if (user.status !== 'active') {
        throw new BadRequestException('Compte introuvable ou inactif.');
      }
      if (isNewAccount) {
        void this.notifyWelcome(user);
      }
      return this.completeUserSession(user);
    }

    if (row.purpose === 'login') {
      let user = await this.usersRepo.findOne({
        where: {
          id: row.referenceId,
          deletedAt: IsNull(),
          status: 'active',
        },
      });
      if (!user) {
        user = await this.findActiveCustomerByEmail(row.email);
      }
      if (!user) {
        throw new BadRequestException('Compte introuvable ou inactif.');
      }
      return this.completeUserSession(user);
    }

    const user = await this.usersRepo.findOne({
      where: { id: row.referenceId, deletedAt: IsNull() },
    });
    if (!user || user.status !== 'active') {
      throw new BadRequestException('Compte introuvable ou inactif.');
    }

    user.lastLoginAt = new Date();
    await this.usersRepo.save(user);

    const tokens = await this.issueTokenPair(user);
    return { ...tokens, user: toAuthUserDto(user) };
  }

  buildAdminRegisterPendingUrl(webOrigin?: string): string {
    const { webUrl } = resolveOAuthWebUrlFromNext('/register/pending', webOrigin);
    return `${webUrl}/register/pending`;
  }

  buildAdminOAuthErrorUrl(
    webOrigin?: string,
    code = 'google_auth_failed',
  ): string {
    const { webUrl } = resolveOAuthWebUrlFromNext('/register', webOrigin);
    const query = new URLSearchParams({ error: code });
    return `${webUrl}/register?${query.toString()}`;
  }

  buildOAuthErrorUrl(
    next: string | undefined,
    code: string,
    webOrigin?: string,
    context?: 'admin_register' | 'web',
  ): string {
    if (context === 'admin_register') {
      return this.buildAdminOAuthErrorUrl(webOrigin, code);
    }
    return this.buildWebOAuthErrorUrl(next, code, webOrigin);
  }

  buildWebVerificationUrl(
    verificationId: string,
    next?: string,
    webOrigin?: string,
    purpose?: EmailOperationPurpose,
  ): string {
    const { webUrl, safeNext } = resolveOAuthWebUrlFromNext(next, webOrigin);
    const query = new URLSearchParams({
      verificationId,
      next: safeNext,
    });
    if (purpose) {
      query.set('purpose', purpose);
    }
    return `${webUrl}/booking/verify?${query.toString()}`;
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
    webOrigin?: string,
  ): string {
    const { webUrl, safeNext } = resolveOAuthWebUrlFromNext(next, webOrigin);
    const query = new URLSearchParams({
      accessToken,
      refreshToken,
      expiresIn: String(expiresIn),
      next: safeNext,
    });
    return `${webUrl}/booking/oauth/callback?${query.toString()}`;
  }

  buildWebOAuthErrorUrl(
    next: string | undefined,
    code = 'google_auth_failed',
    webOrigin?: string,
  ): string {
    const { webUrl, safeNext } = resolveOAuthWebUrlFromNext(next, webOrigin);
    const query = new URLSearchParams({ error: code, next: safeNext });
    return `${webUrl}/booking/login?${query.toString()}`;
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

      const resetUrl = `${this.getResetPasswordBaseUrl()}?token=${rawToken}`;
      const mailResult = await this.emailService.sendPasswordReset({
        to: user.email,
        firstName: user.firstName,
        resetUrl,
      });

      if (process.env.NODE_ENV !== 'production') {
        if (mailResult.previewUrl) {
          this.logger.log(`Password reset preview: ${mailResult.previewUrl}`);
        } else if (!mailResult.sent) {
          this.logger.log(`Password reset link: ${resetUrl}`);
        }
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

  private isDuplicateEmailError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }
    const driverError = error.driverError as { code?: string; sqlMessage?: string };
    if (driverError.code === 'ER_DUP_ENTRY') {
      return true;
    }
    const message = driverError.sqlMessage ?? error.message;
    return message.includes('uk_users_email');
  }

  private requireSecret(key: string): string {
    const value = this.config.get<string>(key);
    if (!value?.trim()) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
  }

  private pendingVerificationResponse(
    verificationId: string,
    purpose?: EmailOperationPurpose,
  ): AuthResponseDto {
    return {
      requiresVerification: true,
      verificationId,
      verificationPurpose: purpose,
      accessToken: '',
      refreshToken: '',
      expiresIn: 0,
    };
  }

  private pendingApprovalResponse(user: Users): AuthResponseDto {
    return {
      pendingApproval: true,
      accessToken: '',
      refreshToken: '',
      expiresIn: 0,
      user: toAuthUserDto(user),
    };
  }

  private assertGmailEmail(email: string): void {
    if (!isGmailAddress(email)) {
      throw new BadRequestException(GMAIL_ONLY_MESSAGE);
    }
  }

  private async createPendingAdminUser(params: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    preferredLanguage?: string;
  }): Promise<Users> {
    await this.ensurePlatformOrg();
    const userId = newId();
    const user = this.usersRepo.create({
      id: userId,
      email: params.email,
      passwordHash: params.passwordHash,
      firstName: params.firstName,
      lastName: params.lastName,
      organizationId: SEED_ORG_PLATFORM_ID,
      status: 'suspended',
      ...(params.phone ? { phone: params.phone } : {}),
      ...(params.preferredLanguage
        ? { preferredLanguage: params.preferredLanguage }
        : {}),
    } as DeepPartial<Users>);

    try {
      await this.usersRepo.save(user);
    } catch (error) {
      if (this.isDuplicateEmailError(error)) {
        throw new ConflictException(EMAIL_ALREADY_REGISTERED_MESSAGE);
      }
      throw error;
    }

    return user;
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private findActiveCustomerByEmail(email: string): Promise<Users | null> {
    return this.usersRepo
      .createQueryBuilder('user')
      .where('LOWER(user.email) = :email', {
        email: this.normalizeEmail(email),
      })
      .andWhere('user.deletedAt IS NULL')
      .andWhere('user.status = :status', { status: 'active' })
      .getOne();
  }

  private findAnyUserByEmail(email: string): Promise<Users | null> {
    return this.usersRepo
      .createQueryBuilder('user')
      .where('LOWER(user.email) = :email', {
        email: this.normalizeEmail(email),
      })
      .getOne();
  }

  private async completeGoogleOAuthVerification(
    row: EmailOperationVerifications,
  ): Promise<AuthResponseDto> {
    const email = this.normalizeEmail(row.email);
    const existing = await this.findAnyUserByEmail(email);

    if (existing && !existing.deletedAt) {
      if (existing.status === 'active') {
        return this.completeUserSession(existing);
      }
      throw new UnauthorizedException('Account is not active');
    }

    if (existing?.deletedAt) {
      const reactivated = await this.reactivateUserFromGoogleSignup(existing, row);
      void this.notifyWelcome(reactivated);
      return this.completeUserSession(reactivated);
    }

    try {
      const user = await this.createUserFromGoogleSignupRow(row);
      void this.notifyWelcome(user);
      return this.completeUserSession(user);
    } catch (err) {
      const recovered = await this.findAnyUserByEmail(email);
      if (recovered && !recovered.deletedAt && recovered.status === 'active') {
        return this.completeUserSession(recovered);
      }
      if (recovered?.deletedAt) {
        const reactivated = await this.reactivateUserFromGoogleSignup(
          recovered,
          row,
        );
        return this.completeUserSession(reactivated);
      }
      throw err;
    }
  }

  private async reactivateUserFromGoogleSignup(
    user: Users,
    row: EmailOperationVerifications,
  ): Promise<Users> {
    const meta = row.metadata ?? {};
    const firstName =
      typeof meta.firstName === 'string' ? meta.firstName : user.firstName;
    const lastName =
      typeof meta.lastName === 'string' ? meta.lastName : user.lastName;

    user.deletedAt = null;
    user.deletedByUserId = null;
    user.status = 'active';
    user.firstName = firstName;
    user.lastName = lastName;
    user.organizationId = user.organizationId ?? SEED_ORG_PLATFORM_ID;
    user.passwordHash = await bcrypt.hash(
      randomBytes(24).toString('hex'),
      BCRYPT_ROUNDS,
    );

    await this.usersRepo.save(user);
    await this.ensureCustomerRoleAssignment(user.id);
    return user;
  }

  private async ensureCustomerRoleAssignment(userId: string): Promise<void> {
    const existing = await this.roleAssignmentsRepo.findOne({
      where: { userId, roleId: SEED_ROLE_CUSTOMER_ID },
    });
    if (existing) {
      return;
    }

    const assignment = this.roleAssignmentsRepo.create({
      id: newId(),
      userId,
      roleId: SEED_ROLE_CUSTOMER_ID,
      scopeType: 'global',
      assignedByUserId: userId,
      assignedAt: new Date(),
    } as DeepPartial<UserRoleAssignments>);
    await this.roleAssignmentsRepo.save(assignment);
  }

  private async startGoogleLoginVerification(
    user: Users,
  ): Promise<AuthResponseDto> {
    if (user.status !== 'active') {
      throw new UnauthorizedException('Account is not active');
    }

    try {
      const { verificationId } = await this.emailVerification.createAndSend({
        email: user.email,
        purpose: 'login',
        referenceId: user.id,
        firstName: user.firstName,
      });
      return this.pendingVerificationResponse(verificationId, 'login');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Google login verification could not be created for ${user.email}: ${message}`,
        err instanceof Error ? err.stack : undefined,
      );
      throw new InternalServerErrorException('Google login could not be started');
    }
  }

  private async completeUserSession(user: Users): Promise<AuthResponseDto> {
    if (user.status !== 'active') {
      throw new BadRequestException('Compte introuvable ou inactif.');
    }
    user.lastLoginAt = new Date();
    await this.usersRepo.save(user);
    const tokens = await this.issueTokenPair(user);
    return { ...tokens, user: toAuthUserDto(user) };
  }

  private async ensurePlatformOrg(): Promise<Organizations> {
    const defaultOrg = await this.organizationsRepo.findOne({
      where: { id: SEED_ORG_PLATFORM_ID, deletedAt: IsNull() },
    });
    if (!defaultOrg) {
      throw new InternalServerErrorException(
        'Default organization is not configured. Run database seeds.',
      );
    }
    return defaultOrg;
  }

  private async assertEmailAvailable(email: string): Promise<void> {
    const existing = await this.usersRepo
      .createQueryBuilder('user')
      .where('LOWER(user.email) = :email', {
        email: this.normalizeEmail(email),
      })
      .andWhere('user.deletedAt IS NULL')
      .getOne();
    if (existing) {
      throw new ConflictException(EMAIL_ALREADY_REGISTERED_MESSAGE);
    }
  }

  private async createUserWithRole(params: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    phone?: string;
    preferredLanguage?: string;
    roleId: string;
    scopeType: 'global' | 'agency';
    scopeId?: string;
  }): Promise<Users> {
    await this.ensurePlatformOrg();
    const userId = newId();
    const user = this.usersRepo.create({
      id: userId,
      email: params.email,
      passwordHash: params.passwordHash,
      firstName: params.firstName,
      lastName: params.lastName,
      organizationId: SEED_ORG_PLATFORM_ID,
      ...(params.phone ? { phone: params.phone } : {}),
      ...(params.preferredLanguage
        ? { preferredLanguage: params.preferredLanguage }
        : {}),
      status: 'active',
    } as DeepPartial<Users>);

    try {
      await this.usersRepo.save(user);
      const assignment = this.roleAssignmentsRepo.create({
        id: newId(),
        userId,
        roleId: params.roleId,
        scopeType: params.scopeType,
        ...(params.scopeId ? { scopeId: params.scopeId } : {}),
        assignedByUserId: userId,
        assignedAt: new Date(),
      } as DeepPartial<UserRoleAssignments>);
      await this.roleAssignmentsRepo.save(assignment);
    } catch (error) {
      if (this.isDuplicateEmailError(error)) {
        throw new ConflictException(EMAIL_ALREADY_REGISTERED_MESSAGE);
      }
      throw error;
    }

    return user;
  }

  private async createUserFromGoogleSignupRow(
    row: EmailOperationVerifications,
  ): Promise<Users> {
    const meta = row.metadata ?? {};
    const firstName =
      typeof meta.firstName === 'string' ? meta.firstName : 'Google';
    const lastName = typeof meta.lastName === 'string' ? meta.lastName : 'User';
    await this.assertEmailAvailable(row.email);
    const passwordHash = await bcrypt.hash(
      randomBytes(24).toString('hex'),
      BCRYPT_ROUNDS,
    );
    return this.createUserWithRole({
      email: row.email,
      passwordHash,
      firstName,
      lastName,
      roleId: SEED_ROLE_CUSTOMER_ID,
      scopeType: 'global',
    });
  }

  private async createUserFromRegisterRow(
    row: EmailOperationVerifications,
  ): Promise<Users> {
    const meta = row.metadata ?? {};
    const passwordHash =
      typeof meta.passwordHash === 'string' ? meta.passwordHash : null;
    if (!passwordHash) {
      throw new BadRequestException("Données d'inscription invalides.");
    }
    const roleId =
      typeof meta.roleId === 'string' ? meta.roleId : SEED_ROLE_CUSTOMER_ID;
    const scopeType: 'global' | 'agency' =
      meta.scopeType === 'agency' ? 'agency' : 'global';
    const scopeId = typeof meta.scopeId === 'string' ? meta.scopeId : undefined;
    const firstName =
      typeof meta.firstName === 'string' ? meta.firstName : 'Client';
    const lastName = typeof meta.lastName === 'string' ? meta.lastName : '';
    await this.assertEmailAvailable(row.email);
    return this.createUserWithRole({
      email: row.email,
      passwordHash,
      firstName,
      lastName,
      ...(typeof meta.phone === 'string' ? { phone: meta.phone } : {}),
      ...(typeof meta.preferredLanguage === 'string'
        ? { preferredLanguage: meta.preferredLanguage }
        : {}),
      roleId,
      scopeType,
      scopeId,
    });
  }

  private async notifyWelcome(user: Users): Promise<void> {
    try {
      const result = await this.emailService.sendWelcome({
        to: user.email,
        firstName: user.firstName,
        webUrl: this.config.get<string>('NEXT_PUBLIC_WEB_URL'),
      });
      if (!result.sent) {
        this.logger.warn(
          `Welcome email was not sent to ${user.email} (check EMAIL_TRANSPORT / SMTP)`,
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Welcome email failed for ${user.email}: ${message}`);
    }
  }

  private async notifySuperAdminsOfPendingRegistration(user: Users): Promise<void> {
    try {
      const recipients =
        await this.permissionsService.listSuperAdminRecipients();
      if (recipients.length === 0) {
        return;
      }

      const adminUrl =
        this.config.get<string>('NEXT_PUBLIC_ADMIN_URL')?.replace(/\/$/, '') ||
        (process.env.NODE_ENV === 'production'
          ? 'https://app-africatourismgate.org'
          : 'http://localhost:3001');
      const reviewUrl = `${adminUrl}/utilisateurs?status=suspended&withoutRole=1`;
      const applicantName =
        [user.firstName, user.lastName].filter(Boolean).join(' ') || user.email;

      for (const recipient of recipients) {
        const result = await this.emailService.sendAdminPendingRegistrationReview(
          {
            to: recipient.email,
            firstName: recipient.firstName,
            applicantName,
            applicantEmail: user.email,
            reviewUrl,
          },
        );
        if (!result.sent) {
          this.logger.warn(
            `Pending registration alert was not sent to ${recipient.email}`,
          );
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(
        `Pending registration alert failed for ${user.email}: ${message}`,
      );
    }
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
