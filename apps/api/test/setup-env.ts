import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = join(__dirname, '../../..');

function loadEnvFile(path: string): void {
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(join(repoRoot, '.env'));
loadEnvFile(join(repoRoot, '.env.local'));

process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
// Always isolate e2e from dev DB (override root .env DATABASE_NAME).
process.env.DATABASE_NAME =
  process.env.E2E_DATABASE_NAME?.trim() ?? 'africatourismgate_test';
process.env.DATABASE_AUTO_SCHEMA =
  process.env.DATABASE_AUTO_SCHEMA ?? 'true';
process.env.DATABASE_AUTO_SEED = process.env.DATABASE_AUTO_SEED ?? 'true';

// Ignore placeholder values from .env.example so e2e can use test defaults.
if (process.env.SEED_ADMIN_PASSWORD === '') {
  delete process.env.SEED_ADMIN_PASSWORD;
}
if (process.env.STRIPE_WEBHOOK_SECRET?.trim() === 'whsec_') {
  delete process.env.STRIPE_WEBHOOK_SECRET;
}
if (process.env.STRIPE_SECRET_KEY?.trim() === 'sk_test_') {
  delete process.env.STRIPE_SECRET_KEY;
}

/** Stub OAuth/URL vars so AppModule boots without .env.local (e2e does not call Google). */
function setEnvIfEmpty(key: string, value: string): void {
  if (!process.env[key]?.trim()) {
    process.env[key] = value;
  }
}

setEnvIfEmpty('GOOGLE_CLIENT_ID', 'e2e-google-client-id');
setEnvIfEmpty('GOOGLE_CLIENT_SECRET', 'e2e-google-client-secret');
setEnvIfEmpty(
  'GOOGLE_CALLBACK_URL',
  'http://localhost:3000/api/auth/google/callback',
);
setEnvIfEmpty('NEXT_PUBLIC_API_URL', 'http://localhost:3000/api');

// Stripe SDK needs an API key to call webhooks.constructEvent (no network in e2e).
setEnvIfEmpty('STRIPE_SECRET_KEY', 'sk_test_e2e_placeholder');
setEnvIfEmpty(
  'STRIPE_WEBHOOK_SECRET',
  'whsec_e2e_test_secret_for_signature_only',
);
