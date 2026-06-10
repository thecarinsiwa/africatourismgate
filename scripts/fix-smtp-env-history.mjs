/**
 * Rewrites .env.production.example in git tree-filter: comment SMTP passwords.
 * Run via: git filter-branch -f --tree-filter "node scripts/fix-smtp-env-history.mjs" <range>
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const path = '.env.production.example';
if (!existsSync(path)) {
  process.exit(0);
}

let content = readFileSync(path, 'utf8');
content = content.replace(
  /^SMTP_SERVICE_PASS=.*$/m,
  '# SMTP_SERVICE_PASS=   # VPS .env only — mot de passe boîte service@',
);
content = content.replace(
  /^SMTP_SUPPORT_PASS=.*$/m,
  '# SMTP_SUPPORT_PASS=   # VPS .env only — mot de passe boîte support@',
);
writeFileSync(path, content);
