/**
 * Production db:sync entrypoint — forces SEED_PROFILE=prod so migrations/seeds
 * skip data for tables outside the install allowlist.
 */
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const result = spawnSync(process.execPath, [join(__dirname, 'db-sync.mjs')], {
  stdio: 'inherit',
  env: {
    ...process.env,
    SEED_PROFILE: 'prod',
  },
});

process.exit(result.status ?? 1);
