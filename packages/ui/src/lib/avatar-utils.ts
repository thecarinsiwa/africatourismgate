/** Deterministic hue (0–359) from an email string. */
export function hashEmailToHue(email: string): number {
  const normalized = email.trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash) % 360;
}

/** Background color for avatar circle (light + dark via CSS color-mix fallback). */
export function hashEmailToColor(email: string): string {
  const hue = hashEmailToHue(email);
  return `hsl(${hue} 55% 45%)`;
}

export function getUserInitials(
  firstName: string | undefined | null,
  lastName: string | undefined | null,
  email: string,
): string {
  const first = firstName?.trim() ?? '';
  const last = lastName?.trim() ?? '';
  if (first && last) {
    return `${first[0]}${last[0]}`.toUpperCase();
  }
  const name = `${first} ${last}`.trim();
  if (name.length >= 2) {
    return name.slice(0, 2).toUpperCase();
  }
  if (name.length === 1) {
    return name.toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function getUserDisplayName(
  firstName: string | undefined | null,
  lastName: string | undefined | null,
  email: string,
): string {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || email;
}
