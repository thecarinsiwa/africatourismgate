import type { VehicleReportLocale } from './vehicle-reports.labels';

export type VehicleWorkbookLabels = {
  sheets: {
    catalog: string;
    categories: string;
    availability: string;
  };
  catalog: {
    id: string;
    licensePlate: string;
    agency: string;
    category: string;
    dailyPrice: string;
    currency: string;
  };
  categories: {
    category: string;
    exampleModel: string;
    vehicleCount: string;
    avgDailyPrice: string;
  };
  availability: {
    licensePlate: string;
    agency: string;
    category: string;
    start: string;
    end: string;
    status: string;
  };
  statusLabels: Record<string, string>;
};

const LABELS: Record<VehicleReportLocale, VehicleWorkbookLabels> = {
  fr: {
    sheets: {
      catalog: 'Catalogue véhicules',
      categories: 'Catégories',
      availability: 'Disponibilités',
    },
    catalog: {
      id: 'ID',
      licensePlate: 'Immatriculation',
      agency: 'Agence',
      category: 'Catégorie',
      dailyPrice: 'Prix / jour',
      currency: 'Devise',
    },
    categories: {
      category: 'Catégorie',
      exampleModel: 'Modèle type',
      vehicleCount: 'Véhicules',
      avgDailyPrice: 'Prix moyen / jour',
    },
    availability: {
      licensePlate: 'Immatriculation',
      agency: 'Agence',
      category: 'Catégorie',
      start: 'Début',
      end: 'Fin',
      status: 'Statut',
    },
    statusLabels: {
      available: 'Disponible',
      maintenance: 'Maintenance',
      rented: 'Loué',
    },
  },
  en: {
    sheets: {
      catalog: 'Vehicle catalog',
      categories: 'Categories',
      availability: 'Availability',
    },
    catalog: {
      id: 'ID',
      licensePlate: 'License plate',
      agency: 'Agency',
      category: 'Category',
      dailyPrice: 'Price / day',
      currency: 'Currency',
    },
    categories: {
      category: 'Category',
      exampleModel: 'Example model',
      vehicleCount: 'Vehicles',
      avgDailyPrice: 'Avg price / day',
    },
    availability: {
      licensePlate: 'License plate',
      agency: 'Agency',
      category: 'Category',
      start: 'Start',
      end: 'End',
      status: 'Status',
    },
    statusLabels: {
      available: 'Available',
      maintenance: 'Maintenance',
      rented: 'Rented',
    },
  },
  es: {
    sheets: {
      catalog: 'Catálogo de vehículos',
      categories: 'Categorías',
      availability: 'Disponibilidad',
    },
    catalog: {
      id: 'ID',
      licensePlate: 'Matrícula',
      agency: 'Agencia',
      category: 'Categoría',
      dailyPrice: 'Precio / día',
      currency: 'Moneda',
    },
    categories: {
      category: 'Categoría',
      exampleModel: 'Modelo de ejemplo',
      vehicleCount: 'Vehículos',
      avgDailyPrice: 'Precio medio / día',
    },
    availability: {
      licensePlate: 'Matrícula',
      agency: 'Agencia',
      category: 'Categoría',
      start: 'Inicio',
      end: 'Fin',
      status: 'Estado',
    },
    statusLabels: {
      available: 'Disponible',
      maintenance: 'Mantenimiento',
      rented: 'Alquilado',
    },
  },
};

export function getVehicleWorkbookLabels(locale: VehicleReportLocale): VehicleWorkbookLabels {
  return LABELS[locale];
}

export function vehicleStatusLabel(
  labels: VehicleWorkbookLabels,
  status: string,
): string {
  return labels.statusLabels[status] ?? status;
}

export function vehicleWorkbookFilename(dateFrom: string, dateTo: string): string {
  const from = dateFrom.slice(0, 10);
  const to = dateTo.slice(0, 10);
  return `vehicules-${from}_${to}.xlsx`;
}

export function vehicleLabel(licensePlate: string | null, vehicleId: string): string {
  return licensePlate?.trim() || vehicleId.slice(0, 8);
}
