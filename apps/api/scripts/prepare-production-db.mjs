/**
 * Prepare a production-ready MySQL database for Africa Tourism Gate.
 *
 * Modes:
 *   check         — run pre-purge control SELECTs only (safe)
 *   purge         — remove demo/test seed data (requires --confirm)
 *   fresh         — create/sync schema + migrations + install seed (no DROP)
 *   reset         — DROP database, then fresh install seed only (requires --confirm)
 *   install-only  — truncate all tables except install seed + schema_migrations
 *                   then re-apply prod/dev seed (production go-live command)
 *
 * Examples:
 *   pnpm db:prepare-prod -- --mode=check
 *   pnpm db:prepare-prod -- --mode=purge --confirm --backup
 *   pnpm db:prepare-prod -- --mode=fresh
 *   pnpm db:prepare-prod -- --mode=reset --confirm --backup
 *   pnpm db:prepare-prod -- --mode=install-only --confirm --backup
 *   pnpm db:prod-install-only -- --backup
 *
 * Env (same as db:sync): DATABASE_HOST, DATABASE_PORT, DATABASE_USER,
 * DATABASE_PASSWORD, DATABASE_NAME — loaded from .env / .env.local.
 *
 * After purge / fresh / reset / install-only: set DATABASE_AUTO_SEED=false and prefer
 * SEED_PROFILE=prod for subsequent `pnpm db:sync` when using the prod seed.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createConnection } from 'mysql2/promise';
import { INSTALL_KEEP_TABLES } from './install-allowed-tables.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../..');
const purgePath = join(root, 'database/scripts/purge-demo-data.sql');
const prodSeedPath = join(root, 'database/seeds/install.seed.prod.sql');
const dbSyncPath = join(__dirname, 'db-sync.mjs');

function log(message) {
  console.log(`[db:prepare-prod] ${message}`);
}

function loadEnvFile(path) {
  if (!existsSync(path)) return;

  for (const rawLine of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const match = line.match(/^([^#=]+)=(.*)$/);
    if (!match) continue;

    const key = match[1].trim();
    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function loadEnv() {
  loadEnvFile(join(root, '.env'));
  loadEnvFile(join(root, '.env.local'));
}

function sanitizeDatabaseName(name) {
  if (!/^[a-zA-Z0-9_]+$/.test(name)) {
    throw new Error(
      `Invalid DATABASE_NAME "${name}". Use only letters, numbers, and underscores.`,
    );
  }
  return name;
}

function getMysqlConfig() {
  return {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? '3306'),
    user: process.env.DATABASE_USER ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? '',
    database: sanitizeDatabaseName(process.env.DATABASE_NAME ?? 'africatourismgate'),
  };
}

function parseArgs(argv) {
  const args = {
    mode: 'check',
    confirm: false,
    backup: false,
    database: null,
    seed: 'prod',
    help: false,
  };

  for (const arg of argv) {
    if (arg === '--') {
      continue;
    }
    if (arg === '--help' || arg === '-h') {
      args.help = true;
      continue;
    }
    if (arg === '--confirm') {
      args.confirm = true;
      continue;
    }
    if (arg === '--backup') {
      args.backup = true;
      continue;
    }
    if (arg.startsWith('--mode=')) {
      args.mode = arg.slice('--mode='.length);
      continue;
    }
    if (arg.startsWith('--database=')) {
      args.database = arg.slice('--database='.length);
      continue;
    }
    if (arg.startsWith('--seed=')) {
      args.seed = arg.slice('--seed='.length).toLowerCase();
      continue;
    }
    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!['check', 'purge', 'fresh', 'reset', 'install-only'].includes(args.mode)) {
    throw new Error(
      `Invalid --mode=${args.mode}. Use check | purge | fresh | reset | install-only.`,
    );
  }
  if (!['prod', 'production', 'dev', 'demo'].includes(args.seed)) {
    throw new Error(`Invalid --seed=${args.seed}. Use prod | dev.`);
  }
  if (args.seed === 'production') args.seed = 'prod';
  if (args.seed === 'demo') args.seed = 'dev';

  return args;
}

function printHelp() {
  console.log(`Usage:
  pnpm db:prepare-prod -- --mode=check|purge|fresh|reset|install-only [options]
  pnpm db:prod-install-only -- [--backup] [--database=NAME]

Modes:
  check         Pre-purge control queries only (default, safe)
  purge         Delete demo/test seed rows (requires --confirm)
  fresh         Schema + migrations + install seed (keeps existing DB if present)
  reset         DROP + recreate DB, then install seed only (requires --confirm)
  install-only  Empty all business tables except install seed tables, then
                re-apply seed (requires --confirm) — use this in production

Options:
  --confirm              Required for purge | reset | install-only
  --backup               mysqldump before destructive modes (needs mysqldump in PATH)
  --database=NAME        Override DATABASE_NAME for this run
  --seed=prod|dev        Install seed (default: prod = no demo catalog)
  --help                 Show this help

Kept by install-only:
  permissions, roles, organizations, users, role_permissions,
  organization_settings, user_role_assignments, amenities, schema_migrations

Afterward:
  DATABASE_AUTO_SEED=false
  SEED_PROFILE=prod pnpm db:sync   # when using --seed=prod
`);
}

function splitSqlStatements(sql) {
  const statements = [];
  let current = '';
  let quote = null;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      current += char;
      if (char === '\n') inLineComment = false;
      continue;
    }

    if (inBlockComment) {
      current += char;
      if (char === '*' && next === '/') {
        current += next;
        i += 1;
        inBlockComment = false;
      }
      continue;
    }

    if (quote) {
      current += char;
      if (char === '\\') {
        current += next ?? '';
        i += 1;
        continue;
      }
      if (char === quote) {
        if (quote === "'" && next === "'") {
          current += next;
          i += 1;
          continue;
        }
        quote = null;
      }
      continue;
    }

    if (char === '-' && next === '-') {
      current += char;
      current += next;
      i += 1;
      inLineComment = true;
      continue;
    }

    if (char === '/' && next === '*') {
      current += char;
      current += next;
      i += 1;
      inBlockComment = true;
      continue;
    }

    if (char === "'" || char === '"' || char === '`') {
      quote = char;
      current += char;
      continue;
    }

    if (char === ';') {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = '';
      continue;
    }

    current += char;
  }

  const trailing = current.trim();
  if (trailing) statements.push(trailing);
  return statements;
}

function stripLeadingComments(statement) {
  return statement
    .replace(/^\s*(?:--[^\r\n]*(?:\r?\n|$)|\/\*[\s\S]*?\*\/\s*)+/g, '')
    .trim();
}

function isIgnorableMissingTableError(error) {
  return error?.code === 'ER_NO_SUCH_TABLE' || error?.errno === 1146;
}

function printSelectResults(selectResults) {
  for (const { statement, rows } of selectResults) {
    console.log(`\n--- ${statement}${statement.length >= 80 ? '…' : ''} ---`);
    console.table(rows);
  }
}

function blockingHits(selectResults) {
  const blockers = [];
  for (const { rows } of selectResults) {
    for (const row of rows) {
      const name = String(row.check_name ?? '');
      if (
        name.startsWith('booking_items') ||
        name.startsWith('reviews') ||
        name.startsWith('promo redemptions')
      ) {
        const hits = Number(row.hit_count ?? 0);
        if (hits > 0) {
          blockers.push({ name, hits });
        }
      }
    }
  }
  return blockers;
}

function purgeStatements() {
  return splitSqlStatements(readFileSync(purgePath, 'utf8'));
}

async function runPrePurgeControls(connection) {
  const selectResults = [];

  for (const statement of purgeStatements()) {
    const clean = stripLeadingComments(statement);
    if (!clean) continue;
    if (/^DELETE\b/i.test(clean) || /^SET\s+FOREIGN_KEY_CHECKS\b/i.test(clean)) {
      break;
    }

    if (/^SET\s+NAMES\b/i.test(clean) || /^SELECT\b/i.test(clean)) {
      try {
        const [rows] = await connection.query(statement);
        if (/^SELECT\b/i.test(clean) && Array.isArray(rows)) {
          selectResults.push({ statement: clean.slice(0, 80), rows });
        }
      } catch (error) {
        if (isIgnorableMissingTableError(error)) {
          log(`Skipping control (table missing): ${clean.slice(0, 72)}…`);
          continue;
        }
        throw error;
      }
    }
  }

  return selectResults;
}

async function runBackup(mysql) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = join(root, 'database/backups');
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, `${mysql.database}-pre-purge-${stamp}.sql`);

  log(`Creating backup via mysqldump → ${outFile}`);
  const result = spawnSync(
    'mysqldump',
    [
      `-h${mysql.host}`,
      `-P${String(mysql.port)}`,
      `-u${mysql.user}`,
      ...(mysql.password ? [`-p${mysql.password}`] : []),
      '--single-transaction',
      '--routines',
      '--triggers',
      mysql.database,
    ],
    { encoding: 'buffer', maxBuffer: 1024 * 1024 * 512 },
  );

  if (result.status !== 0) {
    const stderr = result.stderr?.toString('utf8') || result.error?.message || 'unknown error';
    throw new Error(`mysqldump failed: ${stderr}`);
  }

  writeFileSync(outFile, result.stdout);
  const hash = createHash('sha256').update(result.stdout).digest('hex');
  writeFileSync(`${outFile}.sha256`, `${hash}  ${outFile}\n`);
  log(`Backup OK (SHA-256 ${hash})`);
  return outFile;
}

async function connect(mysql) {
  return createConnection({
    host: mysql.host,
    port: mysql.port,
    user: mysql.user,
    password: mysql.password,
    database: mysql.database,
    multipleStatements: false,
  });
}

async function modeCheck(mysql) {
  log(`Running pre-purge controls on "${mysql.database}"`);
  const connection = await connect(mysql);
  try {
    const selectResults = await runPrePurgeControls(connection);
    printSelectResults(selectResults);

    const blockers = blockingHits(selectResults);
    if (blockers.length > 0) {
      log('BLOCKERS detected — do not purge until resolved:');
      for (const b of blockers) {
        console.log(`  - ${b.name}: ${b.hits}`);
      }
      process.exitCode = 2;
      return;
    }
    log('Controls OK — no booking/review/promo blockers on demo UUIDs.');
    log('Next: pnpm db:prepare-prod -- --mode=purge --confirm [--backup]');
  } finally {
    await connection.end();
  }
}

async function modePurge(mysql, { confirm, backup }) {
  if (!confirm) {
    throw new Error('Refusing purge without --confirm (run --mode=check first).');
  }

  if (backup) {
    await runBackup(mysql);
  } else {
    log('WARNING: proceeding without --backup. Prefer a mysqldump first.');
  }

  const connection = await connect(mysql);
  try {
    const preOnly = await runPrePurgeControls(connection);
    printSelectResults(preOnly);

    const blockers = blockingHits(preOnly);
    if (blockers.length > 0) {
      throw new Error(
        `Aborting purge: blockers found (${blockers.map((b) => `${b.name}=${b.hits}`).join(', ')})`,
      );
    }

    log('Executing purge DELETE statements…');
    let deletes = 0;
    let skippedMissing = 0;
    let pastDeletes = false;
    const postSelects = [];

    for (const statement of purgeStatements()) {
      const clean = stripLeadingComments(statement);
      if (!clean) continue;

      const isDelete = /^DELETE\b/i.test(clean);
      const isFk = /^SET\s+FOREIGN_KEY_CHECKS\b/i.test(clean);
      const isSelect = /^SELECT\b/i.test(clean);
      const isNames = /^SET\s+NAMES\b/i.test(clean);

      if (isDelete || isFk) pastDeletes = true;

      if (isSelect && !pastDeletes) continue;
      if (isNames) {
        await connection.query(statement);
        continue;
      }
      if (!isDelete && !isFk && !isSelect) continue;

      try {
        const [rows] = await connection.query(statement);
        if (isDelete || isFk) deletes += 1;
        if (isSelect && Array.isArray(rows)) {
          postSelects.push({ statement: clean.slice(0, 80), rows });
        }
      } catch (error) {
        if (isIgnorableMissingTableError(error)) {
          skippedMissing += 1;
          log(`Skipping (table missing): ${clean.slice(0, 72)}…`);
          continue;
        }
        throw error;
      }
    }

    printSelectResults(postSelects);
    log(
      `Purge complete (${deletes} delete/FK statements, ${skippedMissing} skipped missing tables).`,
    );
    log('Set DATABASE_AUTO_SEED=false and use SEED_PROFILE=prod for future db:sync.');
    log('Change admin password after first login.');
  } finally {
    await connection.end();
  }
}

function resolveSeedProfile(seed) {
  return seed === 'dev' ? 'dev' : 'prod';
}

function modeFresh(mysql, { seed = 'prod' } = {}) {
  const profile = resolveSeedProfile(seed);
  const seedFile =
    profile === 'prod'
      ? prodSeedPath
      : join(root, 'database/seeds/install.seed.sql');

  if (!existsSync(seedFile)) {
    throw new Error(`Seed file not found: ${seedFile}`);
  }
  if (!existsSync(dbSyncPath)) {
    throw new Error(`db-sync not found: ${dbSyncPath}`);
  }

  log(
    `Fresh bootstrap on "${mysql.database}" (schema + migrations + ${profile} seed)`,
  );
  const result = spawnSync(process.execPath, [dbSyncPath], {
    cwd: root,
    env: {
      ...process.env,
      DATABASE_HOST: mysql.host,
      DATABASE_PORT: String(mysql.port),
      DATABASE_USER: mysql.user,
      DATABASE_PASSWORD: mysql.password,
      DATABASE_NAME: mysql.database,
      SEED_PROFILE: profile,
    },
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error(`db:sync failed with exit code ${result.status ?? 1}`);
  }

  log(`Fresh database ready (${profile} installation seed).`);
  log('Next: DATABASE_AUTO_SEED=false in .env ; change admin password.');
}

async function dropDatabase(mysql) {
  const connection = await createConnection({
    host: mysql.host,
    port: mysql.port,
    user: mysql.user,
    password: mysql.password,
    multipleStatements: false,
  });

  try {
    log(`DROP DATABASE \`${mysql.database}\``);
    await connection.query(`DROP DATABASE IF EXISTS \`${mysql.database}\``);
    await connection.query(
      `CREATE DATABASE \`${mysql.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    log(`CREATE DATABASE \`${mysql.database}\` OK`);
  } finally {
    await connection.end();
  }
}

async function listBaseTables(connection) {
  const [rows] = await connection.query(
    `SELECT TABLE_NAME AS t FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE'
     ORDER BY TABLE_NAME`,
  );
  return rows.map((row) => row.t);
}

async function clearNonInstallTables(connection) {
  const tables = await listBaseTables(connection);
  const toClear = tables.filter((t) => !INSTALL_KEEP_TABLES.has(t));

  log(
    `Truncating ${toClear.length} tables (keeping ${INSTALL_KEEP_TABLES.size} install/ledger tables)…`,
  );
  await connection.query('SET FOREIGN_KEY_CHECKS = 0');
  try {
    for (const table of toClear) {
      await connection.query(`TRUNCATE TABLE \`${table}\``);
    }
  } finally {
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
  }

  const nonEmpty = [];
  for (const table of tables) {
    const [[{ n }]] = await connection.query(`SELECT COUNT(*) AS n FROM \`${table}\``);
    if (n > 0) nonEmpty.push({ table, count: n });
  }
  console.table(nonEmpty);
  return { truncated: toClear.length, nonEmpty };
}

async function modeInstallOnly(mysql, { confirm, backup, seed = 'prod', reseeds = true }) {
  if (!confirm) {
    throw new Error(
      'Refusing install-only without --confirm (truncates every table except install seed).',
    );
  }

  if (backup) {
    await runBackup(mysql);
  } else {
    log('WARNING: install-only without --backup. Prefer a mysqldump first.');
  }

  const connection = await connect(mysql);
  try {
    const { truncated, nonEmpty } = await clearNonInstallTables(connection);
    log(`Cleared ${truncated} tables. Remaining non-empty: ${nonEmpty.length}.`);
  } finally {
    await connection.end();
  }

  if (reseeds) {
    log('Re-applying installation seed (insert-only)…');
    modeFresh(mysql, { seed });
  }

  log('Install-only complete. Set DATABASE_AUTO_SEED=false ; change admin password.');
}

async function modeReset(mysql, { confirm, backup, seed }) {
  if (!confirm) {
    throw new Error(
      'Refusing reset without --confirm (this DROP DATABASE then reloads install seed only).',
    );
  }

  if (backup) {
    try {
      await runBackup(mysql);
    } catch (error) {
      log(
        `Backup skipped/failed (${error instanceof Error ? error.message : String(error)}). Continuing with DROP because --confirm was set.`,
      );
    }
  } else {
    log('WARNING: reset without --backup. Prefer a mysqldump first.');
  }

  await dropDatabase(mysql);
  modeFresh(mysql, { seed });

  // Migrations often INSERT CMS/GAP bootstrap rows; strip them for prod seed.
  if (resolveSeedProfile(seed) === 'prod') {
    log('Stripping migration-injected CMS/GAP rows (prod install-only cleanup)…');
    const connection = await connect(mysql);
    try {
      await clearNonInstallTables(connection);
    } finally {
      await connection.end();
    }
    modeFresh(mysql, { seed });
  }
}

async function main() {
  loadEnv();
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    printHelp();
    return;
  }

  if (args.database) {
    process.env.DATABASE_NAME = sanitizeDatabaseName(args.database);
  }

  const mysql = getMysqlConfig();
  log(`Target ${mysql.user}@${mysql.host}:${mysql.port}/${mysql.database}`);

  if (args.mode === 'check') {
    await modeCheck(mysql);
    return;
  }
  if (args.mode === 'purge') {
    await modePurge(mysql, { confirm: args.confirm, backup: args.backup });
    return;
  }
  if (args.mode === 'fresh') {
    modeFresh(mysql, { seed: args.seed });
    return;
  }
  if (args.mode === 'reset') {
    await modeReset(mysql, {
      confirm: args.confirm,
      backup: args.backup,
      seed: args.seed,
    });
    return;
  }
  if (args.mode === 'install-only') {
    await modeInstallOnly(mysql, {
      confirm: args.confirm,
      backup: args.backup,
      seed: args.seed,
    });
  }
}

main().catch((error) => {
  console.error(`[db:prepare-prod] ${error instanceof Error ? error.stack : String(error)}`);
  process.exitCode = 1;
});
