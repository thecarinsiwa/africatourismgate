import type { BookingPreferredPaymentMethod, BookingStatus } from '@africatourismgate/types';

export const posHistoryPageConfig = {
  title: 'Historique',
  subtitle: 'Ventes du jour enregistrées depuis cette caisse.',
  backToHomeLabel: 'Retour à l’accueil',
  refreshLabel: 'Actualiser',
  loadingLabel: 'Chargement des ventes…',
  emptyTitle: 'Aucune vente aujourd’hui',
  emptyHint: 'Les ventes que vous encaissez apparaîtront ici.',
  errorLabel: 'Impossible de charger l’historique',
  errorHint: 'Vérifiez votre connexion ou réessayez.',
  saleCount: (n: number) => (n === 1 ? '1 vente' : `${n} ventes`),
  bookingLabel: 'Réservation',
  clientLabel: 'Client',
  totalLabel: 'Total',
  openDetailHint: 'Voir le détail et le reçu',
  statusLabels: {
    draft: 'Brouillon',
    pending_approval: 'En attente de validation',
    pending_payment: 'En attente de paiement',
    confirmed: 'Confirmée',
    cancelled: 'Annulée',
    refunded: 'Remboursée',
  } satisfies Record<BookingStatus, string>,
  paymentLabels: {
    cash: 'Espèces',
    stripe: 'Carte',
  } satisfies Record<BookingPreferredPaymentMethod, string>,
  paymentUnknown: '—',
} as const;

export function getHistoryStatusLabel(status: BookingStatus): string {
  return posHistoryPageConfig.statusLabels[status] ?? status;
}

export function getHistoryPaymentLabel(
  method: BookingPreferredPaymentMethod | null | undefined,
): string {
  if (method === 'cash') return posHistoryPageConfig.paymentLabels.cash;
  if (method === 'stripe') return posHistoryPageConfig.paymentLabels.stripe;
  return posHistoryPageConfig.paymentUnknown;
}
