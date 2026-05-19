import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { DeepPartial, IsNull, Repository } from 'typeorm';
import { Users, UserSessions } from '../../entities/generated/users.entity';
import { newId } from '../../common/utils/uuid';
import {
  ACCESS_TOKEN_TYPE,
  BCRYPT_ROUNDS,
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  REFRESH_TOKEN_TYPE,
} from './auth.constants';
import {
  AuthResponseDto,
  AuthTokensResponseDto,
} from './dto/auth-tokens-response.dto';
import { toAuthUserDto } from './dto/auth-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

interface AccessJwtPayload {
  sub: string;
  email: string;
  type: typeof ACCESS_TOKEN_TYPE;
}

interface RefreshJwtPayload {
  sub: string;
  sid: string;
  type: typeof REFRESH_TOKEN_TYPE;
}

@Injectable()
export class AuthService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessExpiresInSeconds: number;
  private readonly refreshExpiresInSeconds: number;

  constructor(
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    @InjectRepository(UserSessions)
    private readonly sessionsRepo: Repository<UserSessions>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
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

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const user = this.usersRepo.create({
      id: newId(),
      email,
      passwordHash,
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      ...(dto.phone ? { phone: dto.phone.trim() } : {}),
      ...(dto.preferredLanguage
        ? { preferredLanguage: dto.preferredLanguage.trim() }
        : {}),
      status: 'active',
    } as DeepPartial<Users>);
    await this.usersRepo.save(user);

    const tokens = await this.issueTokenPair(user);
    return { ...tokens, user: toAuthUserDto(user) };
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
