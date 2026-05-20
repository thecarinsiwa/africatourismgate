/**
 * Used during git rebase --exec to inject secret-free audit test files into commit 8db33ec.
 * @see scripts/gitguardian-rewrite-audit-history.mjs
 */
import { execSync } from 'node:child_process';

const AUDIT_COMMIT = '8db33ec5f12bb674c3aa225df8a81894a64fee48';
const SNAPSHOT_REF = 'refs/atg/secret-fix-snapshot';
const PATCH_FILES = [
  'apps/api/scripts/test-rbac-audit-logs.mjs',
  'apps/api/scripts/lib/load-env.mjs',
  'apps/api/scripts/lib/test-credentials.mjs',
  '.env.example',
  'database/seeds/README.md',
];

const head = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
if (head !== AUDIT_COMMIT) {
  process.exit(0);
}

try {
  execSync(`git checkout ${SNAPSHOT_REF} -- ${PATCH_FILES.join(' ')}`, { stdio: 'inherit' });
  execSync(`git add ${PATCH_FILES.join(' ')}`, { stdio: 'inherit' });
  const staged = execSync('git diff --cached --name-only', { encoding: 'utf8' }).trim();
  if (staged) {
    execSync('git commit --amend --no-edit --no-verify', { stdio: 'inherit' });
  }
} catch (error) {
  console.error('rebase-patch-audit-commit failed:', error.message);
  process.exit(1);
}
