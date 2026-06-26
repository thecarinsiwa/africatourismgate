import type { BookingStatus } from '@africatourismgate/types';

export const bookingStatusLabels: Record<BookingStatus, string> = {
  draft: 'Brouillon',
  pending_approval: 'En attente de validation',
  pending_payment: 'En attente de paiement',
  confirmed: 'Confirmée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
};

export const bookingStatusStyles: Record<
  BookingStatus,
  { badge: string; dot: string }
> = {
  draft: {
    badge: 'bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-white/70',
    dot: 'bg-gray-400',
  },
  pending_approval: {
    badge: 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300',
    dot: 'bg-violet-500',
  },
  pending_payment: {
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
    dot: 'bg-amber-500',
  },
  confirmed: {
    badge: 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300',
    dot: 'bg-green-500',
  },
  cancelled: {
    badge: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
    dot: 'bg-red-500',
  },
  refunded: {
    badge: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
    dot: 'bg-blue-500',
  },
};

export const bookingItemTypeLabels: Record<string, string> = {
  room: 'Hébergement',
  flight_class: 'Vol',
  vehicle: 'Véhicule',
  cabin: 'Cabine',
  activity_schedule: 'Activité',
  package: 'Forfait',
};

export function formatBookingMoney(cents: number, currency: string): string {
  return `${(cents / 100).toFixed(2)} ${currency}`;
}

export function formatBookingDateTime(iso: string, locale = 'fr-FR'): string {
  try {
    return new Date(iso).toLocaleString(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export function formatBookingDate(value: string | null, locale = 'fr-FR'): string {
  if (!value) return '—';
  try {
    return new Date(`${value}T12:00:00`).toLocaleDateString(locale, {
      dateStyle: 'medium',
    });
  } catch {
    return value;
  }
}

export function formatStayRange(
  startDate: string | null,
  endDate: string | null,
  locale = 'fr-FR',
): string {
  if (!startDate && !endDate) return '—';
  if (startDate && endDate && startDate !== endDate) {
    return `${formatBookingDate(startDate, locale)} → ${formatBookingDate(endDate, locale)}`;
  }
  return formatBookingDate(startDate ?? endDate, locale);
}
