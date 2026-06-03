import { SEED_ADMIN_EMAIL } from './constants';

/** Seed admin password from install.seed.sql (override via SEED_ADMIN_PASSWORD). */
const SEED_DEFAULT_PASSWORD = 'ChangeMe123!';

export function getSeedAdminPassword(): string {
  const value = process.env.SEED_ADMIN_PASSWORD?.trim();
  if (value) return value;
  if (process.env.NODE_ENV === 'test') {
    return SEED_DEFAULT_PASSWORD;
  }
  throw new Error(
    'SEED_ADMIN_PASSWORD is required for API e2e tests. Set it in .env.local (see database/seeds/README.md).',
  );
}

export function getSeedAdminLogin() {
  return {
    email: SEED_ADMIN_EMAIL,
    password: getSeedAdminPassword(),
  };
}
