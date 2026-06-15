export type VehicleSpecs = {
  seats: number;
  transmission: string;
  fuel: string;
};

const DEFAULT_SPECS: VehicleSpecs = {
  seats: 5,
  transmission: 'Automatique',
  fuel: 'Essence',
};

function normalizeCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function resolveVehicleSpecs(categoryName: string): VehicleSpecs {
  const normalized = normalizeCategoryName(categoryName);

  if (
    normalized.includes('compact') ||
    normalized.includes('citadine') ||
    normalized.includes('econom') ||
    normalized.includes('eco ')
  ) {
    return { seats: 4, transmission: 'Manuelle', fuel: 'Essence' };
  }

  if (normalized.includes('suv') || normalized.includes('4x4')) {
    return { seats: 5, transmission: 'Automatique', fuel: 'Diesel' };
  }

  if (
    normalized.includes('luxe') ||
    normalized.includes('luxury') ||
    normalized.includes('premium') ||
    normalized.includes('berline')
  ) {
    return { seats: 5, transmission: 'Automatique', fuel: 'Hybride' };
  }

  return DEFAULT_SPECS;
}
