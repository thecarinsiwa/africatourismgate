import type { FlightReportLocale } from './flight-reports.labels';

export type FlightPdfLabels = {
  generatedOn: string;
  kpi: {
    documentTitle: string;
    summarySection: string;
    flights: string;
    classes: string;
    airlines: string;
    airports: string;
    byAirlineSection: string;
    colAirline: string;
    colCount: string;
  };
  catalog: {
    documentTitle: string;
    colFlight: string;
    colAirline: string;
    colRoute: string;
    colClasses: string;
    colDeparture: string;
    empty: string;
  };
  bookings: {
    documentTitle: string;
    periodSection: string;
    periodFrom: string;
    periodTo: string;
    colFlight: string;
    colClass: string;
    colReference: string;
    colStatus: string;
    colTravelDate: string;
    colAmount: string;
    empty: string;
    statusLabels: Record<string, string>;
  };
  dossier: {
    documentTitle: string;
    infoSection: string;
    flightNumber: string;
    airline: string;
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    duration: string;
    classesSection: string;
    emptyClasses: string;
    colCabin: string;
    colSeats: string;
    colBasePrice: string;
  };
  classNames: Record<string, string>;
};

const LABELS: Record<FlightReportLocale, FlightPdfLabels> = {
  fr: {
    generatedOn: 'Document généré le',
    kpi: {
      documentTitle: 'Synthèse KPI — Vols',
      summarySection: 'Indicateurs clés',
      flights: 'Vols',
      classes: 'Classes cabine',
      airlines: 'Compagnies',
      airports: 'Aéroports desservis',
      byAirlineSection: 'Répartition par compagnie',
      colAirline: 'Compagnie',
      colCount: 'Nombre',
    },
    catalog: {
      documentTitle: 'Catalogue vols',
      colFlight: 'Code vol',
      colAirline: 'Compagnie',
      colRoute: 'Trajet',
      colClasses: 'Classes',
      colDeparture: 'Départ',
      empty: 'Aucun vol dans le périmètre sélectionné.',
    },
    bookings: {
      documentTitle: 'Réservations vols',
      periodSection: 'Période',
      periodFrom: 'Du',
      periodTo: 'Au',
      colFlight: 'Vol',
      colClass: 'Cabine',
      colReference: 'Référence',
      colStatus: 'Statut',
      colTravelDate: 'Date de vol',
      colAmount: 'Montant',
      empty: 'Aucune réservation vol sur cette période.',
      statusLabels: {
        draft: 'Brouillon',
        pending_approval: 'En attente validation',
        pending_payment: 'En attente paiement',
        confirmed: 'Confirmée',
        cancelled: 'Annulée',
        refunded: 'Remboursée',
      },
    },
    dossier: {
      documentTitle: 'Dossier vol',
      infoSection: 'Informations',
      flightNumber: 'Code vol',
      airline: 'Compagnie',
      departure: 'Départ',
      arrival: 'Arrivée',
      departureTime: 'Heure de départ',
      arrivalTime: "Heure d'arrivée",
      duration: 'Durée',
      classesSection: 'Classes cabine',
      emptyClasses: 'Aucune classe cabine.',
      colCabin: 'Cabine',
      colSeats: 'Sièges',
      colBasePrice: 'Prix de base',
    },
    classNames: {
      economy: 'Économique',
      premium_economy: 'Premium économique',
      business: 'Affaires',
      first: 'Première',
    },
  },
  en: {
    generatedOn: 'Document generated on',
    kpi: {
      documentTitle: 'KPI summary — Flights',
      summarySection: 'Key metrics',
      flights: 'Flights',
      classes: 'Cabin classes',
      airlines: 'Airlines',
      airports: 'Airports served',
      byAirlineSection: 'Breakdown by airline',
      colAirline: 'Airline',
      colCount: 'Count',
    },
    catalog: {
      documentTitle: 'Flight catalog',
      colFlight: 'Flight code',
      colAirline: 'Airline',
      colRoute: 'Route',
      colClasses: 'Classes',
      colDeparture: 'Departure',
      empty: 'No flights in the selected scope.',
    },
    bookings: {
      documentTitle: 'Flight bookings',
      periodSection: 'Period',
      periodFrom: 'From',
      periodTo: 'To',
      colFlight: 'Flight',
      colClass: 'Cabin',
      colReference: 'Reference',
      colStatus: 'Status',
      colTravelDate: 'Travel date',
      colAmount: 'Amount',
      empty: 'No flight bookings in this period.',
      statusLabels: {
        draft: 'Draft',
        pending_approval: 'Pending approval',
        pending_payment: 'Pending payment',
        confirmed: 'Confirmed',
        cancelled: 'Cancelled',
        refunded: 'Refunded',
      },
    },
    dossier: {
      documentTitle: 'Flight dossier',
      infoSection: 'Information',
      flightNumber: 'Flight code',
      airline: 'Airline',
      departure: 'Departure',
      arrival: 'Arrival',
      departureTime: 'Departure time',
      arrivalTime: 'Arrival time',
      duration: 'Duration',
      classesSection: 'Cabin classes',
      emptyClasses: 'No cabin classes yet.',
      colCabin: 'Cabin',
      colSeats: 'Seats',
      colBasePrice: 'Base price',
    },
    classNames: {
      economy: 'Economy',
      premium_economy: 'Premium economy',
      business: 'Business',
      first: 'First',
    },
  },
  es: {
    generatedOn: 'Documento generado el',
    kpi: {
      documentTitle: 'Resumen KPI — Vuelos',
      summarySection: 'Indicadores clave',
      flights: 'Vuelos',
      classes: 'Clases de cabina',
      airlines: 'Aerolíneas',
      airports: 'Aeropuertos servidos',
      byAirlineSection: 'Distribución por aerolínea',
      colAirline: 'Aerolínea',
      colCount: 'Cantidad',
    },
    catalog: {
      documentTitle: 'Catálogo de vuelos',
      colFlight: 'Código de vuelo',
      colAirline: 'Aerolínea',
      colRoute: 'Ruta',
      colClasses: 'Clases',
      colDeparture: 'Salida',
      empty: 'Ningún vuelo en el alcance seleccionado.',
    },
    bookings: {
      documentTitle: 'Reservas de vuelos',
      periodSection: 'Período',
      periodFrom: 'Desde',
      periodTo: 'Hasta',
      colFlight: 'Vuelo',
      colClass: 'Cabina',
      colReference: 'Referencia',
      colStatus: 'Estado',
      colTravelDate: 'Fecha de vuelo',
      colAmount: 'Importe',
      empty: 'Ninguna reserva de vuelo en este período.',
      statusLabels: {
        draft: 'Borrador',
        pending_approval: 'Pendiente de validación',
        pending_payment: 'Pendiente de pago',
        confirmed: 'Confirmada',
        cancelled: 'Cancelada',
        refunded: 'Reembolsada',
      },
    },
    dossier: {
      documentTitle: 'Dossier de vuelo',
      infoSection: 'Información',
      flightNumber: 'Código de vuelo',
      airline: 'Aerolínea',
      departure: 'Salida',
      arrival: 'Llegada',
      departureTime: 'Hora de salida',
      arrivalTime: 'Hora de llegada',
      duration: 'Duración',
      classesSection: 'Clases de cabina',
      emptyClasses: 'Ninguna clase de cabina.',
      colCabin: 'Cabina',
      colSeats: 'Asientos',
      colBasePrice: 'Precio base',
    },
    classNames: {
      economy: 'Económica',
      premium_economy: 'Económica premium',
      business: 'Business',
      first: 'Primera',
    },
  },
};

export function getFlightPdfLabels(locale: FlightReportLocale): FlightPdfLabels {
  return LABELS[locale];
}

export function flightClassPdfLabel(locale: FlightReportLocale, className: string): string {
  return LABELS[locale].classNames[className] ?? className;
}

export function kpiSummaryPdfFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `kpi-vols-${date}.pdf`;
}

export function catalogPdfFilename(): string {
  const date = new Date().toISOString().slice(0, 10);
  return `catalogue-vols-${date}.pdf`;
}

export function bookingsPdfFilename(dateFrom: string, dateTo: string): string {
  return `reservations-vols-${dateFrom.slice(0, 10)}_${dateTo.slice(0, 10)}.pdf`;
}

export function flightDossierPdfFilename(flightNumber: string): string {
  const safe = flightNumber
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'vol';
  return `dossier-vol-${safe}.pdf`;
}

export function bookingRefLabel(bookingId: string): string {
  return bookingId.slice(0, 8).toUpperCase();
}
