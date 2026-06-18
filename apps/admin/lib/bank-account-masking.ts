export function containsMaskChars(value: string): boolean {
  return value.includes('*');
}

/**
 * Masks account/IBAN values for safe UI display.
 * Keeps only the last 4 visible characters when available.
 */
export function maskAccountNumberForDisplay(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '—';
  if (containsMaskChars(trimmed)) return trimmed;

  const visibleTail = trimmed.slice(-4);
  if (trimmed.length <= 4) {
    return `****${visibleTail}`;
  }
  return `****${visibleTail}`;
}
