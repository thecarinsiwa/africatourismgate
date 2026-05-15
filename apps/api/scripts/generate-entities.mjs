/**
 * Generates TypeORM entity files from database/africatourismgate_database.sql
 * Run: node apps/api/scripts/generate-entities.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../../..');
const sqlPath = join(root, 'database/africatourismgate_database.sql');
const outDir = join(__dirname, '../src/entities/generated');

const AUDIT_COLS = new Set([
  'created_by_user_id',
  'updated_by_user_id',
  'deleted_by_user_id',
  'created_at',
  'updated_at',
  'deleted_at',
]);

const DOMAIN_MAP = {
  users: 'users',
  employees: 'users',
  user_sessions: 'users',
  user_addresses: 'users',
  user_payment_methods: 'users',
  loyalty_accounts: 'users',
  organizations: 'organizations',
  organization_settings: 'organizations',
  organization_bank_accounts: 'organizations',
  permissions: 'rbac',
  roles: 'rbac',
  role_permissions: 'rbac',
  user_role_assignments: 'rbac',
  rbac_audit_logs: 'rbac',
  destinations: 'geography',
  points_of_interest: 'geography',
  amenities: 'accommodations',
  properties: 'accommodations',
  property_images: 'accommodations',
  property_amenities: 'accommodations',
  rooms: 'accommodations',
  room_availability: 'accommodations',
  airlines: 'flights',
  airports: 'flights',
  flights: 'flights',
  flight_classes: 'flights',
  flight_class_availability: 'flights',
  rental_agencies: 'car-rentals',
  vehicle_categories: 'car-rentals',
  vehicles: 'car-rentals',
  vehicle_availability: 'car-rentals',
  cruise_lines: 'cruises',
  cruise_ports: 'cruises',
  ships: 'cruises',
  itineraries: 'cruises',
  itinerary_ports: 'cruises',
  cabins: 'cruises',
  cruise_sailings: 'cruises',
  cabin_availability: 'cruises',
  activity_providers: 'activities',
  activities: 'activities',
  activity_schedules: 'activities',
  packages: 'packages',
  package_items: 'packages',
  bookings: 'commerce',
  booking_items: 'commerce',
  payments: 'commerce',
  promo_codes: 'commerce',
  promotions: 'commerce',
  reviews: 'reviews',
  support_tickets: 'support',
  support_messages: 'support',
};

function toPascal(s) {
  return s
    .split('_')
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

function toCamel(s) {
  const p = toPascal(s);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

function parseEnumValues(typeStr) {
  const m = typeStr.match(/^ENUM\((.+)\)$/i);
  if (!m) return null;
  return m[1].split(',').map((v) => v.trim().replace(/^'|'$/g, ''));
}

function sqlTypeToTs(col) {
  const t = col.sqlType.toUpperCase();
  if (t.startsWith('ENUM')) {
    const vals = parseEnumValues(col.sqlType);
    return { tsType: vals.map((v) => `'${v}'`).join(' | '), columnType: 'enum', enumValues: vals };
  }
  if (t.startsWith('CHAR') || t.startsWith('VARCHAR')) return { tsType: 'string', columnType: 'varchar' };
  if (t === 'TEXT') return { tsType: 'string', columnType: 'text' };
  if (t.startsWith('DECIMAL')) return { tsType: 'string', columnType: 'decimal' };
  if (t.startsWith('INT') || t.startsWith('SMALLINT') || t.startsWith('TINYINT'))
    return { tsType: col.sqlType.includes('UNSIGNED') ? 'number' : 'number', columnType: 'int' };
  if (t === 'JSON') return { tsType: 'Record<string, unknown>', columnType: 'json' };
  if (t === 'DATE') return { tsType: 'string', columnType: 'date' };
  if (t === 'DATETIME' || t === 'TIMESTAMP') return { tsType: 'Date', columnType: t === 'DATE' ? 'date' : 'datetime' };
  if (t === 'TIME') return { tsType: 'string', columnType: 'time' };
  return { tsType: 'unknown', columnType: 'varchar' };
}

function parseTables(sql) {
  const tables = [];
  const re = /CREATE TABLE `(\w+)` \(([\s\S]*?)\) ENGINE=/g;
  let m;
  while ((m = re.exec(sql))) {
    const name = m[1];
    const body = m[2];
    const columns = [];
    const pkCols = [];
    for (const line of body.split('\n')) {
      const trimmed = line.trim().replace(/,$/, '');
      if (!trimmed || trimmed.startsWith('--')) continue;
      if (trimmed.startsWith('PRIMARY KEY')) {
        const pk = trimmed.match(/PRIMARY KEY \(`([^`]+)`(?:,`([^`]+)`)?/);
        if (pk) {
          if (pk[1]) pkCols.push(pk[1]);
          if (pk[2]) pkCols.push(pk[2]);
        }
        continue;
      }
      if (
        trimmed.startsWith('UNIQUE') ||
        trimmed.startsWith('KEY') ||
        trimmed.startsWith('CONSTRAINT') ||
        trimmed.startsWith('CHECK')
      )
        continue;
      const colMatch = trimmed.match(/^`(\w+)`\s+(\S+)/);
      if (!colMatch) continue;
      const colName = colMatch[1];
      let sqlType = colMatch[2];
      if (sqlType.startsWith('ENUM')) {
        const end = trimmed.indexOf(')', trimmed.indexOf('ENUM'));
        sqlType = trimmed.slice(trimmed.indexOf('ENUM'), end + 1);
      }
      const nullable = !trimmed.includes('NOT NULL');
      const isPk = pkCols.includes(colName) || (colName === 'id' && pkCols.length === 0);
      columns.push({ name: colName, sqlType, nullable, isPk: colName === 'id' });
    }
    const pkLine = body.match(/PRIMARY KEY \(([^)]+)\)/);
    const primaryKeys = pkLine
      ? pkLine[1].split(',').map((s) => s.trim().replace(/`/g, ''))
      : columns.filter((c) => c.name === 'id').map((c) => c.name);
    tables.push({ name, columns, primaryKeys });
  }
  return tables;
}

function buildEntityBody(table) {
  const className = toPascal(table.name);
  const hasAudit = table.columns.some((c) => c.name === 'created_at');
  const extendsAudit = hasAudit ? ' extends BaseAuditEntity' : '';

  const lines = [`@Entity('${table.name}')`, `export class ${className}${extendsAudit} {`];

  const isCompositePk = table.primaryKeys.length > 1;

  for (const col of table.columns) {
    if (AUDIT_COLS.has(col.name) && hasAudit) continue;
    const prop = toCamel(col.name);
    const { tsType, columnType, enumValues } = sqlTypeToTs(col);
    const opts = [`name: '${col.name}'`];
    if (columnType === 'varchar' && col.sqlType.match(/CHAR\((\d+)\)/i)) {
      const len = col.sqlType.match(/CHAR\((\d+)\)/i)?.[1] ?? col.sqlType.match(/VARCHAR\((\d+)\)/i)?.[1];
      if (len) opts.push(`length: ${len}`);
    }
    if (columnType === 'decimal') {
      const dm = col.sqlType.match(/DECIMAL\((\d+),(\d+)\)/i);
      if (dm) opts.push(`precision: ${dm[1]}`, `scale: ${dm[2]}`);
    }
    if (enumValues) opts.push(`enum: ${JSON.stringify(enumValues)}`);
    if (col.nullable) opts.push('nullable: true');
    if (col.name === 'password_hash') opts.push("select: false");

    const isPk = table.primaryKeys.includes(col.name);
    if (isPk && isCompositePk) {
      lines.push(`  @PrimaryColumn({ ${opts.join(', ')} })`);
    } else if (isPk && col.name === 'id') {
      lines.push(`  @PrimaryColumn('uuid', { ${opts.join(', ')} })`);
    } else {
      const typeOpt = columnType === 'enum' ? '' : `type: '${columnType}', `;
      lines.push(`  @Column({ ${typeOpt}${opts.join(', ')} })`);
    }
    lines.push(`  ${prop}!: ${tsType};`, '');
  }

  lines.push('}');
  return { className, body: lines.join('\n') };
}

const sql = readFileSync(sqlPath, 'utf8');
const tables = parseTables(sql);
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const byDomain = {};
for (const table of tables) {
  const domain = DOMAIN_MAP[table.name] ?? 'misc';
  if (!byDomain[domain]) byDomain[domain] = [];
  byDomain[domain].push(table);
}

const allExports = [];
for (const [domain, domainTables] of Object.entries(byDomain)) {
  const parts = domainTables.map((t) => buildEntityBody(t));
  const header = [
    "import { Entity, Column, PrimaryColumn } from 'typeorm';",
    "import { BaseAuditEntity } from '../../common/entities/base-audit.entity';",
    '',
  ].join('\n');
  const file = join(outDir, `${domain}.entity.ts`);
  writeFileSync(file, header + parts.map((p) => p.body).join('\n\n'));
  allExports.push(...parts.map((p) => `export { ${p.className} } from './${domain}.entity';`));
}

writeFileSync(join(outDir, 'index.ts'), allExports.join('\n') + '\n');
console.log(`Generated ${tables.length} entities in ${outDir}`);
