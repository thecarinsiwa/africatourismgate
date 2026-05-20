import { randomUUID } from 'node:crypto';

/**
 * Credentials for local integration scripts — never hardcode passwords here.
 * Set SEED_ADMIN_PASSWORD in .env.local (matches database/seeds/README.md).
 */
export function requireEnv(name, hint) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${hint} Set ${name} in .env or .env.local.`);
  }
  return value;
}

export const SEED_ADMIN_EMAIL =
  process.env.SEED_ADMIN_EMAIL?.trim() ?? 'admin@africatourismgate.local';

export function getSeedAdminPassword() {
  return requireEnv(
    'SEED_ADMIN_PASSWORD',
    'Seed admin password required for integration scripts.',
  );
}

export function getRbacTestSupportEmail(
  fallback = 'rbac.support.test@africatourismgate.local',
) {
  return process.env.RBAC_TEST_SUPPORT_EMAIL?.trim() ?? fallback;
}

export function getRbacTestSupportPassword() {
  return requireEnv(
    'RBAC_TEST_SUPPORT_PASSWORD',
    'Support test user password required for RBAC integration scripts.',
  );
}

/** One-off password for ephemeral users created during a test run. */
export function ephemeralTestPassword() {
  return `Test_${randomUUID().replace(/-/g, '').slice(0, 16)}!1aA`;
}
