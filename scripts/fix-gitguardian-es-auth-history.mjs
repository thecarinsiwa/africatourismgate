/**
 * Rewrites ES auth email placeholders in the working tree (used by git filter-branch).
 * Avoids GitGuardian "Company Email Password" false positives on i18n placeholders.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';

const files = ['apps/admin/messages/es.json', 'apps/admin/messages/es/auth.json'];

for (const file of files) {
  if (!existsSync(file)) continue;
  const content = readFileSync(file, 'utf8');
  const next = content
    .replaceAll('usuario@ejemplo.com', 'tu@ejemplo.com')
    .replaceAll('usted@ejemplo.com', 'tu@ejemplo.com');
  if (next !== content) {
    writeFileSync(file, next, 'utf8');
  }
}
