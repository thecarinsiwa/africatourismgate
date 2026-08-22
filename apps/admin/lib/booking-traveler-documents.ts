import type { BookingIdentityDocument } from '@africatourismgate/types';

/** Stable order for index-based traveler ↔ document association (oldest first). */
export function sortDocumentsForTravelerIndex(
  documents: BookingIdentityDocument[],
): BookingIdentityDocument[] {
  return [...documents].sort((a, b) => {
    const byCreatedAt =
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (byCreatedAt !== 0) {
      return byCreatedAt;
    }
    return a.id.localeCompare(b.id);
  });
}

/** Returns the document associated with traveler row `index` (0-based), or null. */
export function documentForTravelerIndex(
  documents: BookingIdentityDocument[],
  index: number,
): BookingIdentityDocument | null {
  if (index < 0) {
    return null;
  }
  const sorted = sortDocumentsForTravelerIndex(documents);
  return sorted[index] ?? null;
}
