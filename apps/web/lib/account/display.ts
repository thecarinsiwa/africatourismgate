export function formatProfileDisplayName(
  firstName: string,
  lastName: string,
  email: string,
): string {
  const name = `${firstName} ${lastName}`.trim();
  return name || email;
}

export function getProfileInitials(
  firstName: string,
  lastName: string,
  email: string,
): string {
  const parts = `${firstName} ${lastName}`.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0]!.length > 0) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}
