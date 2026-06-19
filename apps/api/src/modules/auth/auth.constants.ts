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
export const SEED_ROLE_CUSTOMER_ID = '00000000-0000-4000-8000-000000000103';

export const PASSWORD_RESET_TTL_SECONDS = Number(
  process.env.PASSWORD_RESET_TTL ?? 3600,
);

export const FORGOT_PASSWORD_GENERIC_MESSAGE =
  'Si un compte existe pour cette adresse, un lien de réinitialisation a été envoyé.';

export const RESET_PASSWORD_INVALID_MESSAGE =
  'Lien de réinitialisation expiré ou invalide.';

export const EMAIL_ALREADY_REGISTERED_MESSAGE = 'Email already registered';
