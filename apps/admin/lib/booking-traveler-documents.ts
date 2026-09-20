import type { BookingIdentityDocument } from '@africatourismgate/types';

/** Documents linked to a manifest traveler entry (all versions / types). */
export function documentsForManifestEntry(
  documents: BookingIdentityDocument[],
  manifestEntryId: string | null | undefined,
): BookingIdentityDocument[] {
  if (!manifestEntryId) {
    return [];
  }
  return documents
    .filter((doc) => doc.manifestEntryId === manifestEntryId)
    .sort(
      (a, b) =>
        a.documentType.localeCompare(b.documentType) ||
        b.version - a.version ||
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

/**
 * Latest document for a traveler entry (highest version, then newest createdAt).
 * Replaces the former index-based heuristic.
 */
export function latestDocumentForManifestEntry(
  documents: BookingIdentityDocument[],
  manifestEntryId: string | null | undefined,
): BookingIdentityDocument | null {
  const matched = documentsForManifestEntry(documents, manifestEntryId);
  if (matched.length === 0) {
    return null;
  }
  return matched.reduce((best, doc) => {
    if (doc.version > best.version) {
      return doc;
    }
    if (doc.version < best.version) {
      return best;
    }
    return new Date(doc.createdAt).getTime() > new Date(best.createdAt).getTime()
      ? doc
      : best;
  });
}

/** Historical documents not linked to any manifest entry. */
export function unlinkedIdentityDocuments(
  documents: BookingIdentityDocument[],
): BookingIdentityDocument[] {
  return documents
    .filter((doc) => !doc.manifestEntryId)
    .sort(
      (a, b) =>
        a.documentType.localeCompare(b.documentType) || b.version - a.version,
    );
}
