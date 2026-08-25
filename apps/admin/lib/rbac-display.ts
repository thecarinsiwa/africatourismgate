import type { DataTableBadgeVariant } from '@africatourismgate/ui';

const ROLE_CODE_VARIANTS: Record<string, DataTableBadgeVariant> = {
  super_admin: 'danger',
  org_admin: 'warning',
  property_manager: 'success',
  support_agent: 'default',
  sales_manager: 'default',
  content_editor: 'muted',
  gap_coordinator: 'success',
  customer: 'muted',
};

const CUSTOM_ROLE_VARIANTS: DataTableBadgeVariant[] = [
  'default',
  'success',
  'warning',
  'muted',
];

export type RbacScopeDisplayLabels = {
  global: string;
  property: string;
  agency: string;
  support_queue: string;
  withId: (params: { label: string; idPrefix: string }) => string;
  withName: (params: { label: string; name: string }) => string;
};

export function formatPermissionDomain(
  resource: string,
  labels: Record<string, string>,
  emptyDash = '—',
): string {
  const trimmed = resource.trim();
  if (!trimmed) return emptyDash;
  return labels[trimmed] ?? trimmed.replace(/_/g, ' ');
}

export function formatPermissionAction(
  action: string,
  labels: Record<string, string>,
): string {
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
  labels: RbacScopeDisplayLabels,
  scopeId?: string | null,
  scopeName?: string | null,
): string {
  if (scopeType === 'global') return labels.global;
  const label = labels[scopeType] ?? scopeType;
  if (scopeName) return labels.withName({ label, name: scopeName });
  if (!scopeId) return label;
  return labels.withId({ label, idPrefix: scopeId.slice(0, 8) });
}
