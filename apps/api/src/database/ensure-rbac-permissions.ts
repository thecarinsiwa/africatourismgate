import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createConnection } from 'mysql2/promise';
import { getMysqlConfig } from './mysql-config';

const logger = new Logger('DatabaseBootstrap');

const PLATFORM_ORG_ID = '00000000-0000-4000-8000-000000000001';
const USER_SUPER_ADMIN_ID = '00000000-0000-4000-8000-000000000010';
const ROLE_SUPER_ADMIN_ID = '00000000-0000-4000-8000-000000000100';
const ROLE_ORG_ADMIN_ID = '00000000-0000-4000-8000-000000000101';
const URA_SUPER_ADMIN_ID = '00000000-0000-4000-8000-000000000050';

/** Permissions that may be missing on DBs seeded before RBAC / employees deliverables. */
const PERMISSION_UPSERTS: Array<{
  id: string;
  code: string;
  resource: string;
  action: string;
  description: string;
}> = [
  {
    id: '00000000-0000-4000-8000-000000001016',
    code: 'roles.read',
    resource: 'roles',
    action: 'read',
    description: 'View roles',
  },
  {
    id: '00000000-0000-4000-8000-000000001017',
    code: 'roles.write',
    resource: 'roles',
    action: 'write',
    description: 'Manage roles',
  },
  {
    id: '00000000-0000-4000-8000-000000001018',
    code: 'permissions.read',
    resource: 'permissions',
    action: 'read',
    description: 'View permissions',
  },
  {
    id: '00000000-0000-4000-8000-000000001027',
    code: 'employees.read',
    resource: 'employees',
    action: 'read',
    description: 'View employees',
  },
  {
    id: '00000000-0000-4000-8000-000000001028',
    code: 'employees.write',
    resource: 'employees',
    action: 'write',
    description: 'Manage employees',
  },
  {
    id: '00000000-0000-4000-8000-000000001029',
    code: 'organization_bank_accounts.read',
    resource: 'organization_bank_accounts',
    action: 'read',
    description: 'View organization bank accounts',
  },
  {
    id: '00000000-0000-4000-8000-000000001030',
    code: 'organization_bank_accounts.write',
    resource: 'organization_bank_accounts',
    action: 'write',
    description: 'Manage organization bank accounts',
  },
  {
    id: '00000000-0000-4000-8000-000000001043',
    code: 'guides.read',
    resource: 'guides',
    action: 'read',
    description: 'View tour guides',
  },
  {
    id: '00000000-0000-4000-8000-000000001044',
    code: 'guides.write',
    resource: 'guides',
    action: 'write',
    description: 'Manage tour guides',
  },
  {
    id: '00000000-0000-4000-8000-000000001045',
    code: 'bookings.approve',
    resource: 'bookings',
    action: 'approve',
    description: 'Approve or reject assisted booking requests',
  },
];

/** Full org_admin set (install.seed.sql) — repairs partial or missing grants. */
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
  '00000000-0000-4000-8000-000000001029',
  '00000000-0000-4000-8000-000000001030',
  '00000000-0000-4000-8000-000000001043',
  '00000000-0000-4000-8000-000000001044',
  '00000000-0000-4000-8000-000000001045',
];

async function platformOrgExists(config: ConfigService): Promise<boolean> {
  const mysql = getMysqlConfig(config);
  const connection = await createConnection({
    host: mysql.host,
    port: mysql.port,
    user: mysql.user,
    password: mysql.password,
    database: mysql.database,
  });

  try {
    const [tables] = await connection.query(
      `SELECT COUNT(*) AS count
       FROM information_schema.tables
       WHERE table_schema = ? AND table_name = 'organizations'`,
      [mysql.database],
    );
    if (Number((tables as { count: number }[])[0]?.count ?? 0) === 0) {
      return false;
    }

    const [rows] = await connection.query(
      `SELECT COUNT(*) AS count FROM \`organizations\`
       WHERE \`id\` = ? AND \`deleted_at\` IS NULL`,
      [PLATFORM_ORG_ID],
    );
    return Number((rows as { count: number }[])[0]?.count ?? 0) > 0;
  } finally {
    await connection.end();
  }
}

/**
 * Idempotent RBAC repair for existing databases:
 * - upsert permissions added after initial seed
 * - grant all permissions to super_admin
 * - repair full org_admin permission set (incl. users.read, roles.*)
 * - ensure seed admin keeps an active super_admin assignment
 */
export async function ensureRbacPermissions(config: ConfigService): Promise<void> {
  if (!(await platformOrgExists(config))) {
    return;
  }

  const mysql = getMysqlConfig(config);
  const connection = await createConnection({
    host: mysql.host,
    port: mysql.port,
    user: mysql.user,
    password: mysql.password,
    database: mysql.database,
  });

  try {
    for (const perm of PERMISSION_UPSERTS) {
      await connection.query(
        `INSERT INTO \`permissions\` (\`id\`, \`code\`, \`resource\`, \`action\`, \`description\`)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           \`code\` = VALUES(\`code\`),
           \`resource\` = VALUES(\`resource\`),
           \`action\` = VALUES(\`action\`),
           \`description\` = VALUES(\`description\`),
           \`deleted_at\` = NULL`,
        [perm.id, perm.code, perm.resource, perm.action, perm.description],
      );
    }

    const [superAdminResult] = await connection.query(
      `INSERT INTO \`role_permissions\` (\`role_id\`, \`permission_id\`, \`granted_by_user_id\`)
       SELECT ?, p.\`id\`, ?
       FROM \`permissions\` p
       WHERE p.\`deleted_at\` IS NULL
       ON DUPLICATE KEY UPDATE
         \`deleted_at\` = NULL,
         \`granted_by_user_id\` = VALUES(\`granted_by_user_id\`)`,
      [ROLE_SUPER_ADMIN_ID, USER_SUPER_ADMIN_ID],
    );
    const superAdminLinked = (superAdminResult as { affectedRows?: number })
      .affectedRows;

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
      [
        URA_SUPER_ADMIN_ID,
        USER_SUPER_ADMIN_ID,
        ROLE_SUPER_ADMIN_ID,
        USER_SUPER_ADMIN_ID,
      ],
    );

    logger.log(
      `RBAC permissions synchronized (super_admin links: ${superAdminLinked ?? 'ok'})`,
    );
  } catch (err) {
    logger.error(
      `RBAC permission sync failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  } finally {
    await connection.end();
  }
}
