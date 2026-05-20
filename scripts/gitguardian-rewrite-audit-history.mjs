/**
 * Rewrites commit 8db33ec so test-rbac-audit-logs.mjs never contained hardcoded passwords.
 * Run from repo root after committing all secret-removal changes:
 *   node scripts/gitguardian-rewrite-audit-history.mjs
 * Then force-push the PR branch:
 *   git push --force-with-lease origin feature/admin-rbac-audit-logs
 */
import { execSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const AUDIT_COMMIT = '8db33ec5f12bb674c3aa225df8a81894a64fee48';
const DROP_COMMITS = new Set([
  'd35bc1f5f4170af02be750632436686483f20f13', // Fix Guard secure rbac — folded into 8db33ec
]);
const SNAPSHOT_REF = 'refs/atg/secret-fix-snapshot';
const REBASE_PARENT = 'fdf1889';

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf8', stdio: opts.inherit ? 'inherit' : 'pipe', ...opts });
}

function main() {
  const branch = run('git branch --show-current').trim();
  const dirty = run('git status --porcelain').trim();
  if (dirty) {
    console.error('Commit or stash your changes before running this script.');
    process.exit(1);
  }

  console.log(`Branch: ${branch}`);
  run(`git update-ref ${SNAPSHOT_REF} HEAD`);
  console.log(`Snapshot saved at ${SNAPSHOT_REF}`);

  const parent = run(`git rev-parse ${REBASE_PARENT}`).trim();
  const commits = run(`git rev-list --reverse ${parent}..HEAD`)
    .trim()
    .split('\n')
    .filter(Boolean);

  const lines = [];
  for (const hash of commits) {
    const short = hash.slice(0, 7);
    const subject = run(`git log -1 --format=%s ${hash}`).trim();
    if (DROP_COMMITS.has(hash)) {
      lines.push(`drop ${short} ${subject}`);
      continue;
    }
    lines.push(`pick ${short} ${subject}`);
    if (hash === AUDIT_COMMIT) {
      const patchCmd = [
        `git checkout ${SNAPSHOT_REF} -- apps/api/scripts/test-rbac-audit-logs.mjs`,
        'apps/api/scripts/lib/load-env.mjs',
        'apps/api/scripts/lib/test-credentials.mjs',
        '.env.example',
        'database/seeds/README.md',
        '&& git add apps/api/scripts/test-rbac-audit-logs.mjs',
        'apps/api/scripts/lib/load-env.mjs',
        'apps/api/scripts/lib/test-credentials.mjs',
        '.env.example',
        'database/seeds/README.md',
        '&& (git diff --cached --quiet || git commit --amend --no-edit --no-verify)',
      ].join(' ');
      lines.push(`exec ${patchCmd}`);
    }
  }

  const tmp = mkdtempSync(join(tmpdir(), 'atg-rebase-'));
  const todoContent = lines.join('\n') + '\n';
  writeFileSync(join(tmp, 'todo.txt'), todoContent);

  const editorPath = join(tmp, 'editor.cmd');
  writeFileSync(
    editorPath,
    `@echo off\r\n copy /Y "${join(tmp, 'todo.txt')}" "%~1"\r\n`,
  );

  console.log('\nRebase todo:\n' + todoContent);
  console.log('Starting rebase (this may take a few minutes)...\n');

  run(`set GIT_SEQUENCE_EDITOR="${editorPath}" && git rebase -i ${parent}`, { inherit: true });

  console.log('\nDone. Verify with:');
  console.log(`  git show ${AUDIT_COMMIT.slice(0, 7)}:apps/api/scripts/test-rbac-audit-logs.mjs | findstr PASSWORD`);
  console.log('Then: git push --force-with-lease origin ' + branch);
}

main();
