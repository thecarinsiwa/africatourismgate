import type { VehicleReportLocale } from './vehicle-reports.labels';

export type VehiclePdfLabels = {
  generatedOn: string;
  kpi: {
    documentTitle: string;
    summarySection: string;
    vehicles: string;
    agencies: string;
    categories: string;
    availabilitySlots: string;
    byAgencySection: string;
    colAgency: string;
    colCount: string;
  };
  catalog: {
    documentTitle: string;
    colVehicle: string;
    colAgency: string;
    colCategory: string;
    colDailyPrice: string;
    empty: string;
  };
  bookings: {
    documentTitle: string;
    periodSection: string;
    periodFrom: string;
    periodTo: string;
    colVehicle: string;
    colAgency: string;
    colReference: string;
    colStatus: string;
    colPickupDate: string;
    colAmount: string;
    empty: string;
    statusLabels: Record<string, string>;
  };
  statusLabels: Record<string, string>;
};

const LABELS: Record<VehicleReportLocale, VehiclePdfLabels> = {
  fr: {
    generatedOn: 'Document généré le',
    kpi: {
      documentTitle: 'Synthèse KPI — Véhicules',
      summarySection: 'Indicateurs clés',
      vehicles: 'Véhicules',
      agencies: 'Agences',
      categories: 'Catégories',
      availabilitySlots: 'Créneaux de disponibilité',
      byAgencySection: 'Répartition par agence',
      colAgency: 'Agence',
      colCount: 'Nombre',
    },
    catalog: {
      documentTitle: 'Catalogue véhicules',
      colVehicle: 'Véhicule',
      colAgency: 'Agence',
      colCategory: 'Catégorie',
      colDailyPrice: 'Prix / jour',
      empty: 'Aucun véhicule dans le périmètre sélectionné.',
    },
    bookings: {
      documentTitle: 'Réservations véhicules',
      periodSection: 'Période',
      periodFrom: 'Du',
      periodTo: 'Au',
      colVehicle: 'Véhicule',
      colAgency: 'Agence',
      colReference: 'Référence',
      colStatus: 'Statut',
      colPickupDate: 'Date de prise',
      colAmount: 'Montant',
      empty: 'Aucune réservation véhicule sur cette période.',
      statusLabels: {
        draft: 'Brouillon',
        pending_approval: 'En attente validation',
        pending_payment: 'En attente paiement',
        confirmed: 'Confirmée',
        cancelled: 'Annulée',
        refunded: 'Remboursée',
      },
    },
    statusLabels: {
      available: 'Disponible',
      maintenance: 'Maintenance',
      rented: 'Loué',
    },
  },
  en: {
    generatedOn: 'Document generated on',
    kpi: {
      documentTitle: 'KPI summary — Vehicles',
      summarySection: 'Key metrics',
      vehicles: 'Vehicles',
      agencies: 'Agencies',
      categories: 'Categories',
      availabilitySlots: 'Availability slots',
      byAgencySection: 'Breakdown by agency',
      colAgency: 'Agency',
      colCount: 'Count',
    },
    catalog: {
      documentTitle: 'Vehicle catalog',
      colVehicle: 'Vehicle',
      colAgency: 'Agency',
      colCategory: 'Category',
      colDailyPrice: 'Price / day',
      empty: 'No vehicles in the selected scope.',
    },
    bookings: {
      documentTitle: 'Vehicle bookings',
      periodSection: 'Period',
      periodFrom: 'From',
      periodTo: 'To',
      colVehicle: 'Vehicle',
      colAgency: 'Agency',
      colReference: 'Reference',
      colStatus: 'Status',
      colPickupDate: 'Pickup date',
      colAmount: 'Amount',
      empty: 'No vehicle bookings in this period.',
      statusLabels: {
        draft: 'Draft',
        pending_approval: 'Pending approval',
        pending_payment: 'Pending payment',
        confirmed: 'Confirmed',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
      },
    },
    statusLabels: {
      available: 'Available',
      maintenance: 'Maintenance',
      rented: 'Rented',
    },
  },
  es: {
    generatedOn: 'Documento generado el',
    kpi: {
      documentTitle: 'Resumen KPI — Vehículos',
      summarySection: 'Indicadores clave',
      vehicles: 'Vehículos',
      agencies: 'Agencias',
      categories: 'Categorías',
      availabilitySlots: 'Franjas de disponibilidad',
      byAgencySection: 'Distribución por agencia',
      colAgency: 'Agencia',
      colCount: 'Cantidad',
    },
    catalog: {
      documentTitle: 'Catálogo de vehículos',
      colVehicle: 'Vehículo',
      colAgency: 'Agencia',
      colCategory: 'Categoría',
      colDailyPrice: 'Precio / día',
      empty: 'Ningún vehículo en el alcance seleccionado.',
    },
    bookings: {
      documentTitle: 'Reservas de vehículos',
      periodSection: 'Período',
      periodFrom: 'Desde',
      periodTo: 'Hasta',
      colVehicle: 'Vehículo',
      colAgency: 'Agencia',
      colReference: 'Referencia',
      colStatus: 'Estado',
      colPickupDate: 'Fecha de recogida',
      colAmount: 'Importe',
      empty: 'Ninguna reserva de vehículo en este período.',
      statusLabels: {
        draft: 'Borrador',
        pending_approval: 'Pendiente de validación',
        pending_payment: 'Pendiente de pago',
        confirmed: 'Confirmada',
        cancelled: 'Cancelada',
        refunded: 'Reembolsada',
      },
    },
    statusLabels: {
      available: 'Disponible',
      maintenance: 'Mantenimiento',
      rented: 'Alquilado',
    },
  },
};

export function getVehiclePdfLabels(locale: VehicleReportLocale): VehiclePdfLabels {
  return LABELS[locale];
}

export function vehicleStatusPdfLabel(locale: VehicleReportLocale, status: string): string {
  return LABELS[locale].statusLabels[status] ?? status;
}

export function kpiSummaryPdfFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `kpi-vehicules-${date}.pdf`;
}

export function catalogPdfFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `catalogue-vehicules-${date}.pdf`;
}

export function bookingsPdfFilename(dateFrom: string, dateTo: string): string {
  return `reservations-vehicules-${dateFrom.slice(0, 10)}_${dateTo.slice(0, 10)}.pdf`;
}

export function bookingRefLabel(bookingId: string): string {
  return bookingId.slice(0, 8).toUpperCase();
}
