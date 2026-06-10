import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, type Profile, type VerifyCallback } from 'passport-google-oauth20';
import { resolveGoogleCallbackUrl } from '../../../common/config/public-api-url';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: ConfigService) {
    const clientID = config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = config.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL =
      config.get<string>('GOOGLE_CALLBACK_URL') ??
      `${(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api').replace(/\/$/, '')}/auth/google/callback`;
      config.get<string>('GOOGLE_CALLBACK_URL') ?? resolveGoogleCallbackUrl();

    if (!clientID?.trim()) {
      throw new Error('Missing required environment variable: GOOGLE_CLIENT_ID');
    }
    if (!clientSecret?.trim()) {
      throw new Error('Missing required environment variable: GOOGLE_CLIENT_SECRET');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: ['profile', 'email'],
      passReqToCallback: true,
    });
  }

  validate(
    req: { query?: { state?: string } },
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const state = typeof req.query?.state === 'string' ? req.query.state : undefined;
    done(null, { profile, state });
  }
}
