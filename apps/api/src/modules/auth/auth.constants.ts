export const BCRYPT_ROUNDS = 10;

export const JWT_ACCESS_EXPIRES_IN =
  process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';

export const JWT_REFRESH_EXPIRES_IN =
  process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

export const ACCESS_TOKEN_TYPE = 'access' as const;
export const REFRESH_TOKEN_TYPE = 'refresh' as const;
