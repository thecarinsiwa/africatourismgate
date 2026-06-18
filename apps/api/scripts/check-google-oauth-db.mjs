import { loadEnv } from './lib/load-env.mjs';
import mysql from 'mysql2/promise';

loadEnv();

const c = await mysql.createConnection({
  host: process.env.DATABASE_HOST ?? 'localhost',
  port: Number(process.env.DATABASE_PORT ?? 3306),
  user: process.env.DATABASE_USER ?? 'root',
  password: process.env.DATABASE_PASSWORD ?? '',
  database: process.env.DATABASE_NAME ?? 'africatourismgate',
});

const [tables] = await c.query(
  `SELECT COUNT(*) AS c FROM information_schema.tables
   WHERE table_schema = ? AND table_name = 'email_operation_verifications'`,
  [process.env.DATABASE_NAME ?? 'africatourismgate'],
);
console.log('email_operation_verifications:', tables[0].c > 0 ? 'OK' : 'MISSING');

const [orgs] = await c.query(
  `SELECT id, name FROM organizations WHERE id = '00000000-0000-4000-8000-000000000001' AND deleted_at IS NULL`,
);
console.log('platform org:', orgs.length ? orgs[0].name : 'MISSING');

const [users] = await c.query(
  `SELECT email, status, created_at FROM users WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 8`,
);
console.log('Recent users:', users);

await c.end();
