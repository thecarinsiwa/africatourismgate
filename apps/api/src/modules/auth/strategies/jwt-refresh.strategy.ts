import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { REFRESH_TOKEN_TYPE } from '../auth.constants';
import { RefreshJwtPayload } from '../interfaces/jwt-payload.interface';

function refreshTokenFromRequest(req: Request): string | null {
  const body = req.body as { refreshToken?: string } | undefined;
  if (typeof body?.refreshToken === 'string' && body.refreshToken.trim()) {
    return body.refreshToken.trim();
  }
  return ExtractJwt.fromAuthHeaderAsBearerToken()(req);
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(config: ConfigService) {
    const secret = config.get<string>('JWT_REFRESH_SECRET');
    if (!secret?.trim()) {
      throw new Error('Missing required environment variable: JWT_REFRESH_SECRET');
    }

    super({
      jwtFromRequest: refreshTokenFromRequest,
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: false,
    });
  }

  validate(payload: RefreshJwtPayload): RefreshJwtPayload {
    if (payload.type !== REFRESH_TOKEN_TYPE || !payload.sub || !payload.sid) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    return payload;
  }
}
