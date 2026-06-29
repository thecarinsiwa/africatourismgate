#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const adminRoot = path.join(root, 'apps/admin');

const ERROR_SPECS = [
  { file: 'users-errors', key: 'users', fn: 'getUsersErrorMessage' },
  { file: 'bookings-errors', key: 'bookings', fn: 'getBookingsErrorMessage' },
  { file: 'hebergements-errors', key: 'hebergements', fn: 'getHebergementsErrorMessage' },
  { file: 'activities-errors', key: 'activities', fn: 'getActivitiesErrorMessage' },
  { file: 'locations-errors', key: 'locations', fn: 'getLocationsErrorMessage' },
  { file: 'packages-errors', key: 'packages', fn: 'getPackagesErrorMessage' },
  { file: 'organizations-errors', key: 'organizations', fn: 'getOrganizationsErrorMessage' },
  { file: 'destinations-errors', key: 'destinations', fn: 'getDestinationsErrorMessage' },
  { file: 'employees-errors', key: 'employees', fn: 'getEmployeesErrorMessage' },
  { file: 'rbac-errors', key: 'rbac', fn: 'getRbacErrorMessage' },
  { file: 'vols-errors', key: 'vols', fn: 'getVolsErrorMessage' },
  { file: 'croisieres-errors', key: 'croisieres', fn: 'getCroisieresErrorMessage' },
  { file: 'reviews-errors', key: 'reviews', fn: 'getReviewsErrorMessage' },
  { file: 'support-tickets-errors', key: 'supportTickets', fn: 'getSupportTicketsErrorMessage' },
  { file: 'promo-codes-errors', key: 'promoCodes', fn: 'getPromoCodesErrorMessage' },
  { file: 'promotions-errors', key: 'promotions', fn: 'getPromotionsErrorMessage' },
  { file: 'loyalty-accounts-errors', key: 'loyaltyAccounts', fn: 'getLoyaltyAccountsErrorMessage' },
  { file: 'payments-errors', key: 'payments', fn: 'getPaymentsErrorMessage' },
  { file: 'organization-settings-errors', key: 'organizationSettings', fn: 'getOrganizationSettingsErrorMessage' },
  { file: 'dashboard-api-errors', key: 'dashboardKpi', fn: 'getDashboardKpiErrorMessage' },
];

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.next') walk(full, files);
    } else if (/\.tsx$/.test(entry.name)) {
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
  let content = fs.readFileSync(filePath, 'utf8');
  const used = ERROR_SPECS.filter((s) => content.includes(s.fn));
  if (used.length === 0) return false;

  let next = content.replace(/^import\s+\{[^}]+\}\s+from\s+['"][^'"]*-errors['"];\n/gm, '');

  const hookImport = `import { useAdminErrorMessages } from '${relativeHookImport(filePath)}';`;
  if (!next.includes('useAdminErrorMessages')) {
    const lastImport = [...next.matchAll(/^import .+;\n/gm)].pop();
    if (lastImport) {
      const idx = lastImport.index + lastImport[0].length;
      next = `${next.slice(0, idx)}${hookImport}\n${next.slice(idx)}`;
    } else {
      next = `'use client';\n\n${hookImport}\n${next}`;
    }
  }

  const destructuring = used.map((s) => `${s.key}: ${s.fn}`).join(', ');
  const hookLine = `  const { ${destructuring} } = useAdminErrorMessages();`;

  if (next.includes(hookLine)) {
    fs.writeFileSync(filePath, next);
    return true;
  }

  const fnMatch = next.match(/export function \w+\([^)]*\)\s*\{/);
  if (!fnMatch) return false;

  const pos = fnMatch.index + fnMatch[0].length;
  next = `${next.slice(0, pos)}\n${hookLine}${next.slice(pos)}`;

  fs.writeFileSync(filePath, next);
  return true;
}

const files = walk(path.join(adminRoot, 'components')).concat(walk(path.join(adminRoot, 'app')));
let count = 0;
for (const file of files) {
  if (processFile(file)) count++;
}
console.log(`Updated ${count} files`);
