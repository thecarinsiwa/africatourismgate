export function employmentDateFieldErrors(
  hireDate: string,
  terminationDate: string,
  message = 'La date d’embauche doit être antérieure à la date de fin.',
): { hireDate?: string; terminationDate?: string } {
  if (!hireDate || !terminationDate || hireDate < terminationDate) {
    return {};
  }
  return {
    hireDate: message,
    terminationDate: message,
  };
}

/** Jour précédent (YYYY-MM-DD) pour contrainte `max` sur la date d’embauche. */
export function dayBefore(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

/** Jour suivant (YYYY-MM-DD) pour contrainte `min` sur la date de fin. */
export function dayAfter(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
