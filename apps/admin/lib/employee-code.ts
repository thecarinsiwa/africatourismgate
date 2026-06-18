import type { Employee, OrganizationListItem } from '@africatourismgate/types';

const DEFAULT_PREFIX = 'ATG';
const MAX_PREFIX_LENGTH = 6;

function organizationPrefixFromSlug(slug: string | null | undefined): string {
  if (!slug?.trim()) return DEFAULT_PREFIX;
  const cleaned = slug.replace(/[^a-z0-9]/gi, '').toUpperCase();
  return cleaned.slice(0, MAX_PREFIX_LENGTH) || DEFAULT_PREFIX;
}

function formatEmployeeCode(prefix: string, sequence: number): string {
  return `${prefix}-EMP-${String(sequence).padStart(4, '0')}`;
}

/** Aperçu du prochain code (aligné sur la logique API). */
export function suggestNextEmployeeCode(
  organizationId: string,
  organizations: OrganizationListItem[],
  employees: Employee[],
): string {
  const org = organizationId
    ? organizations.find((o) => o.id === organizationId)
    : undefined;
  const prefix = organizationPrefixFromSlug(org?.slug);

  const count = employees.filter((emp) =>
    organizationId
      ? emp.organizationId === organizationId
      : emp.organizationId == null,
  ).length;

  return formatEmployeeCode(prefix, count + 1);
}
