import type { OrganizationStatus } from '@africatourismgate/types';

export const organizationStatusLabels: Record<OrganizationStatus, string> = {
  active: 'Actif',
  suspended: 'Suspendu',
  deleted: 'Supprimé',
};

export const organizationStatusVariants: Record<
  OrganizationStatus,
  'success' | 'muted' | 'danger'
> = {
  active: 'success',
  suspended: 'muted',
  deleted: 'danger',
};

export const organizationLegalFormOptions = [
  { value: '', label: 'Non renseigné' },
  { value: 'SARL', label: 'SARL' },
  { value: 'SA', label: 'SA' },
  { value: 'SAS', label: 'SAS' },
  { value: 'Ets', label: 'Établissement (Ets)' },
  { value: 'SNC', label: 'SNC' },
  { value: 'ASBL', label: 'ASBL' },
] as const;

export function formatOrganizationLegalForm(
  legalForm: string | null | undefined,
): string {
  const trimmed = legalForm?.trim();
  if (!trimmed) return '—';
  const known = organizationLegalFormOptions.find((o) => o.value === trimmed);
  return known?.label ?? trimmed;
}

export function getOrganizationInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function formatOrganizationCount(count: number): string {
  return new Intl.NumberFormat('fr-FR').format(count);
}
