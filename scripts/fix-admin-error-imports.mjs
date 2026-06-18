#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const adminRoot = path.join(root, 'apps/admin');

const ERROR_SPECS = [
  ['users', 'getUsersErrorMessage'],
  ['bookings', 'getBookingsErrorMessage'],
  ['hebergements', 'getHebergementsErrorMessage'],
  ['activities', 'getActivitiesErrorMessage'],
  ['locations', 'getLocationsErrorMessage'],
  ['packages', 'getPackagesErrorMessage'],
  ['organizations', 'getOrganizationsErrorMessage'],
  ['destinations', 'getDestinationsErrorMessage'],
  ['employees', 'getEmployeesErrorMessage'],
  ['rbac', 'getRbacErrorMessage'],
  ['vols', 'getVolsErrorMessage'],
  ['croisieres', 'getCroisieresErrorMessage'],
  ['reviews', 'getReviewsErrorMessage'],
  ['supportTickets', 'getSupportTicketsErrorMessage'],
  ['promoCodes', 'getPromoCodesErrorMessage'],
  ['promotions', 'getPromotionsErrorMessage'],
  ['loyaltyAccounts', 'getLoyaltyAccountsErrorMessage'],
  ['payments', 'getPaymentsErrorMessage'],
  ['organizationSettings', 'getOrganizationSettingsErrorMessage'],
  ['dashboardKpi', 'getDashboardKpiErrorMessage'],
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next'].includes(entry.name)) walk(full, files);
    } else if (entry.name.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

function relativeHookImport(fromFile) {
  const hookPath = path.join(adminRoot, 'lib/i18n/use-admin-error-messages');
  let rel = path.relative(path.dirname(fromFile), hookPath).replace(/\\/g, '/');
  if (!rel.startsWith('.')) rel = `./${rel}`;
  return rel;
}

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const used = ERROR_SPECS.filter(([, fn]) => content.includes(fn));
  if (used.length === 0) return false;

  let next = content.replace(/^'use client';\r?\n/gm, '').trimStart();
  next = `'use client';\n\n${next}`;
  next = next.replace(/^import\s+\{[^}]+\}\s+from\s+['"][^'"]*-errors['"];\r?\n/gm, '');
  next = next.replace(/^import\s+\{\s*useAdminErrorMessages\s*\}\s+from\s+['"][^'"]+['"];\r?\n/m, '');

  const hookImport = `import { useAdminErrorMessages } from '${relativeHookImport(filePath)}';`;
  next = `'use client';\n\n${hookImport}\n${next.replace(/^'use client';\r?\n\r?\n/, '')}`;

  const destructuring = used.map(([key, fn]) => `${key}: ${fn}`).join(', ');
  const hookLine = `  const { ${destructuring} } = useAdminErrorMessages();`;
  next = next.replace(/^\s*const\s+\{[^}]+\}\s+=\s+useAdminErrorMessages\(\);\r?\n/gm, '');

  const fnMatch = next.match(/export function \w+\([^)]*\)\s*\{/);
  if (fnMatch) {
    const pos = fnMatch.index + fnMatch[0].length;
    next = `${next.slice(0, pos)}\n${hookLine}${next.slice(pos)}`;
  }

  fs.writeFileSync(filePath, next);
  return true;
}

let count = 0;
for (const file of walk(path.join(adminRoot, 'components')).concat(walk(path.join(adminRoot, 'app')))) {
  if (processFile(file)) count += 1;
}
console.log(`Fixed ${count} files`);
