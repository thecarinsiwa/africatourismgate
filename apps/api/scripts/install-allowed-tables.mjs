/**
 * Tables allowed for production install seed / install-only cleanup.
 * Keep in sync with database/seeds/install.seed.prod.sql.
 */
export const INSTALL_SEED_TABLES = [
  'permissions',
  'roles',
  'organizations',
  'users',
  'role_permissions',
  'organization_settings',
  'user_role_assignments',
  'amenities',
];

/** Tables that must not be truncated by install-only (seed + migration ledger). */
export const INSTALL_KEEP_TABLES = new Set([
  ...INSTALL_SEED_TABLES,
  'schema_migrations',
]);

/**
 * Tables whose data DML (INSERT/UPDATE/DELETE/REPLACE) may run from migrations
 * when SEED_PROFILE=prod. Excludes organizations/users so demo tenants (e.g. Guichet Est)
 * are not re-inserted by migrations.
 */
export const PROD_MIGRATION_DATA_TABLES = new Set([
  'permissions',
  'roles',
  'role_permissions',
  'user_role_assignments',
  'organization_settings',
  // Institutional CMS defaults (skipped on first apply when prodSafe was stricter).
  'about_pages',
  // SYSCO-002 — plan / exercices seed plateforme
  'chart_of_accounts',
  'accounting_exercises',
  'accounting_periods',
  // SYSCO-003 — journaux seed plateforme
  'accounting_journals',
]);

export function isProdSeedProfile(env = process.env) {
  const profile = (env.SEED_PROFILE ?? 'dev').toLowerCase();
  if (profile === 'prod' || profile === 'production') return true;

  const seedFile = (env.DATABASE_SEED_FILE ?? '').toLowerCase().replace(/\\/g, '/');
  return seedFile.endsWith('install.seed.prod.sql');
}

/**
 * Extract primary target table from a DML statement, or null if not DML / unknown.
 */
export function extractDmlTable(statement) {
  const clean = String(statement)
    .replace(/^\s*(?:--[^\r\n]*(?:\r?\n|$)|\/\*[\s\S]*?\*\/\s*)+/g, '')
    .trim();

  const patterns = [
    /^(?:INSERT\s+(?:IGNORE\s+)?INTO|REPLACE\s+INTO)\s+`?([a-zA-Z0-9_]+)`?/i,
    /^UPDATE\s+`?([a-zA-Z0-9_]+)`?/i,
    /^DELETE\s+FROM\s+`?([a-zA-Z0-9_]+)`?/i,
  ];

  for (const pattern of patterns) {
    const match = clean.match(pattern);
    if (match) return match[1].toLowerCase();
  }
  return null;
}

export function isDataMutationStatement(statement) {
  const clean = String(statement)
    .replace(/^\s*(?:--[^\r\n]*(?:\r?\n|$)|\/\*[\s\S]*?\*\/\s*)+/g, '')
    .trim();
  return /^(?:INSERT|REPLACE|UPDATE|DELETE)\b/i.test(clean);
}
