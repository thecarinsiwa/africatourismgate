import type { DataTableBadgeVariant } from '@africatourismgate/ui';

const PERMISSION_DOMAIN_LABELS: Record<string, string> = {
  amenities: 'Équipements',
  bookings: 'Réservations',
  cruises: 'Croisières',
  destinations: 'Destinations',
  employees: 'Employés',
  flights: 'Vols',
  loyalty: 'Fidélité',
  organizations: 'Organisations',
  payments: 'Paiements',
  permissions: 'Permissions',
  promo_codes: 'Codes promo',
  properties: 'Hébergements',
  promotions: 'Promotions',
  reviews: 'Avis',
  roles: 'Rôles',
  support: 'Support',
  users: 'Utilisateurs',
  vehicles: 'Locations',
  activities: 'Activités',
  packages: 'Forfaits',
};

const ROLE_CODE_VARIANTS: Record<string, DataTableBadgeVariant> = {
  super_admin: 'danger',
  org_admin: 'warning',
  property_manager: 'success',
  support_agent: 'default',
  sales_manager: 'default',
  content_editor: 'muted',
  customer: 'muted',
};

const CUSTOM_ROLE_VARIANTS: DataTableBadgeVariant[] = [
  'default',
  'success',
  'warning',
  'muted',
];

export function formatPermissionDomain(resource: string): string {
  const trimmed = resource.trim();
  if (!trimmed) return '—';
  return PERMISSION_DOMAIN_LABELS[trimmed] ?? trimmed.replace(/_/g, ' ');
}

export function formatPermissionAction(action: string): string {
  const labels: Record<string, string> = {
    read: 'Lecture',
    write: 'Écriture',
    delete: 'Suppression',
    manage: 'Gestion',
    approve: 'Approbation',
  };
  return labels[action] ?? action;
}

export function getRoleBadgeVariant(code: string): DataTableBadgeVariant {
  const known = ROLE_CODE_VARIANTS[code];
  if (known) return known;

  let hash = 0;
  for (let index = 0; index < code.length; index += 1) {
    hash = (hash + code.charCodeAt(index) * (index + 1)) % CUSTOM_ROLE_VARIANTS.length;
  }
  return CUSTOM_ROLE_VARIANTS[hash] ?? 'default';
}

export function formatAssignmentScope(
  scopeType: 'global' | 'property' | 'agency' | 'support_queue',
  scopeId?: string | null,
): string {
  if (scopeType === 'global') return 'Global';
  const labels: Record<string, string> = {
    property: 'Établissement',
    agency: 'Agence',
    support_queue: 'File support',
  };
  const label = labels[scopeType] ?? scopeType;
  if (!scopeId) return label;
  return `${label} · ${scopeId.slice(0, 8)}…`;
}
