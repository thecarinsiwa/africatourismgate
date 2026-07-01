/**
 * Google OAuth auth flow smoke checks (without real Google login roundtrip).
 * Run: pnpm --filter @africatourismgate/api test:auth-google-oauth
 */
import { loadEnv } from './lib/load-env.mjs';

loadEnv();

const API_PORT = process.env.API_PORT ?? '3000';
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? `http://localhost:${API_PORT}/api`
).replace(/\/$/, '');

async function main() {
  console.log(`API: ${API_URL}`);

  const start = await fetch(`${API_URL}/auth/google?next=%2Fbooking%2Fcart`, {
    redirect: 'manual',
  });
  if (![301, 302].includes(start.status)) {
    throw new Error(`Expected redirect on /auth/google, got ${start.status}`);
  }
  const startLocation = start.headers.get('location') ?? '';
  if (!startLocation.includes('accounts.google.com')) {
    throw new Error('Expected Google auth redirect URL');
  }
  console.log('  OK /auth/google redirects to Google consent');

  const googleUrl = new URL(startLocation);
  const redirectUri = googleUrl.searchParams.get('redirect_uri') ?? '';
  const apiIsLocal = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\//.test(
    `${API_URL}/`,
  );
  if (apiIsLocal && redirectUri && !redirectUri.includes('localhost')) {
    throw new Error(
      `Local API uses production Google callback (${redirectUri}). ` +
        'Set GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback in .env.local, ' +
        'add the same URI in Google Cloud Console, then restart the API.',
    );
  }
  if (redirectUri) {
    console.log(`  callback redirect_uri: ${redirectUri}`);
  }

  const callbackWithoutCode = await fetch(`${API_URL}/auth/google/callback`, {
    redirect: 'manual',
  });
  if (![301, 302].includes(callbackWithoutCode.status)) {
    throw new Error(
      `Expected redirect on callback without code, got ${callbackWithoutCode.status}`,
    );
  }
  console.log('  OK /auth/google/callback handles missing code with redirect');
  console.log('\nGoogle OAuth smoke checks passed.');
}

main().catch((err) => {
  console.error('\nGoogle OAuth smoke test failed:', err.message);
  process.exit(1);
});
