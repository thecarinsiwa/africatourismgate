/** Deep-links admin pour les résultats de recherche globale. */
export const adminSearchDeepLinks = {
  user: (id: string) => `/utilisateurs/${id}/voir`,
  organization: (id: string) => `/organisations/${id}/voir`,
  booking: (id: string) => `/reservations/${id}`,
  property: (id: string) => `/hebergements/${id}/voir`,
  /** Pas de fiche paiement dédiée : on ouvre la réservation liée. */
  paymentBooking: (bookingId: string) => `/reservations/${bookingId}`,
  supportTicket: (id: string) => `/contenu/tickets/${id}`,
  activity: (id: string) => `/produits/activites/${id}/voir`,
  flight: (id: string) => `/produits/vols/${id}/voir`,
  vehicle: (id: string) => `/produits/locations/${id}/voir`,
  package: (id: string) => `/produits/forfaits/${id}/voir`,
  sailing: (id: string) => `/produits/croisieres/${id}`,
  blogPost: (id: string) => `/contenu/blog/${id}`,
  destination: (id: string) => `/produits/destinations/${id}/voir`,
  employee: (id: string) => `/utilisateurs/employes/${id}/voir`,
} as const;

export function formatAdminSearchPersonName(
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  fallback: string,
): string {
  const name = `${firstName ?? ''} ${lastName ?? ''}`.trim();
  return name || fallback;
}

export function formatAdminSearchIdPrefix(id: string, length = 8): string {
  return id.slice(0, length);
}
