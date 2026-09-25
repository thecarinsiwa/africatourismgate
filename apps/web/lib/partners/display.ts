const PARTNER_COLORS = [
  '#0f2744',
  '#008751',
  '#003b73',
  '#c8102e',
  '#1a9ed7',
  '#5c4b37',
] as const;

export function partnerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
  }
  return name.trim().slice(0, 2).toUpperCase() || '?';
}

export function partnerColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return PARTNER_COLORS[hash % PARTNER_COLORS.length]!;
}
