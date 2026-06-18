export type VehicleTransmission = 'manual' | 'automatic';
export type VehicleFuel = 'petrol' | 'diesel' | 'hybrid' | 'electric';

export type VehicleSpecs = {
  seats: number;
  transmission: VehicleTransmission;
  fuel: VehicleFuel;
  airConditioning: boolean;
};

export type VehicleEquipmentKey = 'airConditioning' | 'bluetooth' | 'gps' | 'usb';

function normalizeCategoryName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/** Specs dérivées de la catégorie — en attendant exposition API dédiée. */
export function resolveVehicleSpecs(categoryName: string): VehicleSpecs {
  const normalized = normalizeCategoryName(categoryName);

  if (
    normalized.includes('compact') ||
    normalized.includes('citadine') ||
    normalized.includes('econom') ||
    normalized.includes('eco ')
  ) {
    return {
      seats: 4,
      transmission: 'manual',
      fuel: 'petrol',
      airConditioning: true,
    };
  }

  if (normalized.includes('suv') || normalized.includes('4x4')) {
    return {
      seats: 5,
      transmission: 'automatic',
      fuel: 'diesel',
      airConditioning: true,
    };
  }

  if (
    normalized.includes('luxe') ||
    normalized.includes('luxury') ||
    normalized.includes('premium') ||
    normalized.includes('berline')
  ) {
    return {
      seats: 5,
      transmission: 'automatic',
      fuel: 'hybrid',
      airConditioning: true,
    };
  }

  return {
    seats: 5,
    transmission: 'automatic',
    fuel: 'petrol',
    airConditioning: true,
  };
}

export function resolveVehicleEquipment(
  categoryName: string,
  specs: VehicleSpecs,
): VehicleEquipmentKey[] {
  const normalized = normalizeCategoryName(categoryName);
  const items: VehicleEquipmentKey[] = ['usb'];

  if (specs.airConditioning) {
    items.unshift('airConditioning');
  }

  if (
    normalized.includes('suv') ||
    normalized.includes('4x4') ||
    normalized.includes('premium') ||
    normalized.includes('luxe') ||
    normalized.includes('luxury')
  ) {
    items.push('bluetooth', 'gps');
  }

  return items;
}
