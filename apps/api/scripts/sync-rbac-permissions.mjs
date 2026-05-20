/**
 * Repair RBAC permissions in MySQL (same logic as API startup ensure-rbac-permissions).
 * Run: pnpm --filter @africatourismgate/api sync:rbac
 */
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createConnection } from 'mysql2/promise';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../..');

const USER_SUPER_ADMIN_ID = '00000000-0000-4000-8000-000000000010';
const ROLE_SUPER_ADMIN_ID = '00000000-0000-4000-8000-000000000100';
const ROLE_ORG_ADMIN_ID = '00000000-0000-4000-8000-000000000101';
const URA_SUPER_ADMIN_ID = '00000000-0000-4000-8000-000000000050';

const PERMISSION_UPSERTS = [
  ['00000000-0000-4000-8000-000000001016', 'roles.read', 'roles', 'read', 'View roles'],
  ['00000000-0000-4000-8000-000000001017', 'roles.write', 'roles', 'write', 'Manage roles'],
  [
    '00000000-0000-4000-8000-000000001018',
    'permissions.read',
    'permissions',
    'read',
    'View permissions',
  ],
  [
    '00000000-0000-4000-8000-000000001027',
    'employees.read',
    'employees',
    'read',
    'View employees',
  ],
  [
    '00000000-0000-4000-8000-000000001028',
    'employees.write',
    'employees',
    'write',
    'Manage employees',
  ],
];

const ORG_ADMIN_PERMISSION_IDS = [
  '00000000-0000-4000-8000-000000001001',
  '00000000-0000-4000-8000-000000001002',
  '00000000-0000-4000-8000-000000001004',
  '00000000-0000-4000-8000-000000001005',
  '00000000-0000-4000-8000-000000001006',
  '00000000-0000-4000-8000-000000001007',
  '00000000-0000-4000-8000-000000001008',
  '00000000-0000-4000-8000-000000001009',
  '00000000-0000-4000-8000-000000001010',
  '00000000-0000-4000-8000-000000001011',
  '00000000-0000-4000-8000-000000001012',
  '00000000-0000-4000-8000-000000001013',
  '00000000-0000-4000-8000-000000001014',
  '00000000-0000-4000-8000-000000001016',
  '00000000-0000-4000-8000-000000001017',
  '00000000-0000-4000-8000-000000001018',
  '00000000-0000-4000-8000-000000001025',
  '00000000-0000-4000-8000-000000001026',
  '00000000-0000-4000-8000-000000001027',
  '00000000-0000-4000-8000-000000001028',
];

function loadEnv() {
  for (const name of ['.env', '.env.local']) {
    const path = join(root, name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m && !process.env[m[1].trim()]) {
        process.env[m[1].trim()] = m[2].trim();
      }
    }
  }
}

loadEnv();

const mysql = {
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? '3306'),
  user: process.env.DATABASE_USER ?? 'root',
  password: process.env.DATABASE_PASSWORD ?? '',
  database: process.env.DATABASE_NAME ?? 'africatourismgate',
};

const connection = await createConnection(mysql);

try {
  for (const [id, code, resource, action, description] of PERMISSION_UPSERTS) {
    await connection.query(
      `INSERT INTO \`permissions\` (\`id\`, \`code\`, \`resource\`, \`action\`, \`description\`)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         \`code\` = VALUES(\`code\`),
         \`resource\` = VALUES(\`resource\`),
         \`action\` = VALUES(\`action\`),
         \`description\` = VALUES(\`description\`),
         \`deleted_at\` = NULL`,
      [id, code, resource, action, description],
    );
  }

  const [superResult] = await connection.query(
    `INSERT INTO \`role_permissions\` (\`role_id\`, \`permission_id\`, \`granted_by_user_id\`)
     SELECT ?, p.\`id\`, ?
     FROM \`permissions\` p
     WHERE p.\`deleted_at\` IS NULL
     ON DUPLICATE KEY UPDATE
       \`deleted_at\` = NULL,
       \`granted_by_user_id\` = VALUES(\`granted_by_user_id\`)`,
    [ROLE_SUPER_ADMIN_ID, USER_SUPER_ADMIN_ID],
  );

  for (const permissionId of ORG_ADMIN_PERMISSION_IDS) {
    await connection.query(
      `INSERT INTO \`role_permissions\` (\`role_id\`, \`permission_id\`, \`granted_by_user_id\`)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         \`deleted_at\` = NULL,
         \`granted_by_user_id\` = VALUES(\`granted_by_user_id\`)`,
      [ROLE_ORG_ADMIN_ID, permissionId, USER_SUPER_ADMIN_ID],
    );
  }

  await connection.query(
    `INSERT INTO \`user_role_assignments\` (
       \`id\`, \`user_id\`, \`role_id\`, \`scope_type\`, \`assigned_by_user_id\`
     ) VALUES (?, ?, ?, 'global', ?)
     ON DUPLICATE KEY UPDATE
       \`revoked_at\` = NULL,
       \`revoked_by_user_id\` = NULL,
       \`revoke_reason\` = NULL,
       \`deleted_at\` = NULL`,
    [URA_SUPER_ADMIN_ID, USER_SUPER_ADMIN_ID, ROLE_SUPER_ADMIN_ID, USER_SUPER_ADMIN_ID],
  );

  console.log('RBAC sync OK', {
    database: mysql.database,
    superAdminRolePermissions: superResult.affectedRows,
    orgAdminPermissions: ORG_ADMIN_PERMISSION_IDS.length,
  });
} finally {
  await connection.end();
}
