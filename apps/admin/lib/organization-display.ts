import type { OrganizationStatus } from '@africatourismgate/types';

export const organizationStatusVariants: Record<
  OrganizationStatus,
  'success' | 'muted' | 'danger'
> = {
  active: 'success',
  suspended: 'muted',
  deleted: 'danger',
};

export const ORGANIZATION_LEGAL_FORM_VALUES = [
  '',
  'SARL',
  'SA',
  'SAS',
  'Ets',
  'SNC',
  'ASBL',
] as const;

export function formatOrganizationLegalForm(
  legalForm: string | null | undefined,
  options: ReadonlyArray<{ value: string; label: string }>,
  emptyLabel = '—',
): string {
  const trimmed = legalForm?.trim();
  if (!trimmed) return emptyLabel;
  const known = options.find((o) => o.value === trimmed);
  return known?.label ?? trimmed;
}

export function getOrganizationInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function formatOrganizationCount(count: number): string {
  return new Intl.NumberFormat('fr-FR').format(count);
}
