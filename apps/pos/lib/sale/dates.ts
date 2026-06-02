function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Nuit par défaut : aujourd’hui → demain (POS). */
export function defaultRoomStayDates(): { startDate: string; endDate: string } {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { startDate: toIsoDate(start), endDate: toIsoDate(end) };
}

/** Vol : dans 7 jours par défaut. */
export function defaultFlightDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return toIsoDate(d);
}

export function formatDisplayDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function formatDisplayDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
