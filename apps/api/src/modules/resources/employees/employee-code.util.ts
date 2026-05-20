const DEFAULT_PREFIX = 'ATG';
const MAX_PREFIX_LENGTH = 6;

export function organizationPrefixFromSlug(slug: string | null | undefined): string {
  if (!slug?.trim()) return DEFAULT_PREFIX;
  const cleaned = slug.replace(/[^a-z0-9]/gi, '').toUpperCase();
  return cleaned.slice(0, MAX_PREFIX_LENGTH) || DEFAULT_PREFIX;
}

export function formatEmployeeCode(prefix: string, sequence: number): string {
  return `${prefix}-EMP-${String(sequence).padStart(4, '0')}`;
}
