/** Initiales affichées sur l'avatar d'un avis (prénom ou libellé invité). */
export function getGuestInitials(authorFirstName: string): string {
  const parts = authorFirstName.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
  }
  if (parts.length === 1 && parts[0]!.length > 0) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return '?';
}
