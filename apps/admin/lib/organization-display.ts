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

export function formatOrganizationLegalForm(
  legalForm: string | null | undefined,
): string {
  const trimmed = legalForm?.trim();
  return trimmed || '—';
}

export function getOrganizationInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || '?';
}

export function formatOrganizationCount(count: number): string {
  return new Intl.NumberFormat('fr-FR').format(count);
}
