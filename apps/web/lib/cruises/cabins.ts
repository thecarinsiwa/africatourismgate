export type CabinDeckKey = 'main' | 'upper' | 'promenade';

function normalizeCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Pont dérivé de la catégorie — en attendant exposition API dédiée. */
export function resolveCabinDeck(categoryName: string): CabinDeckKey {
  const normalized = normalizeCategoryName(categoryName);

  if (
    normalized.includes('suite') ||
    normalized.includes('premium') ||
    normalized.includes('luxe') ||
    normalized.includes('luxury')
  ) {
    return 'upper';
  }

  if (
    normalized.includes('balcon') ||
    normalized.includes('balcony') ||
    normalized.includes('veranda')
  ) {
    return 'promenade';
  }

  return 'main';
}
