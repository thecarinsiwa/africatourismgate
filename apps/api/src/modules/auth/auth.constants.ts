export const BCRYPT_ROUNDS = 10;

export const JWT_ACCESS_EXPIRES_IN =
  process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';

export const JWT_REFRESH_EXPIRES_IN =
  process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

export const ACCESS_TOKEN_TYPE = 'access' as const;
export const REFRESH_TOKEN_TYPE = 'refresh' as const;

/** Fixed seed IDs — see database/seeds/seed-ids.txt */
export const SEED_ORG_PLATFORM_ID = '00000000-0000-4000-8000-000000000001';
export const SEED_ROLE_ORG_ADMIN_ID = '00000000-0000-4000-8000-000000000101';
