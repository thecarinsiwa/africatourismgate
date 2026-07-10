import type { FlightReportLocale } from './flight-reports.labels';

export type FlightWorkbookLabels = {
  sheets: {
    catalog: string;
    classes: string;
    availability: string;
  };
  catalog: {
    id: string;
    flightNumber: string;
    airline: string;
    airlineIata: string;
    departure: string;
    arrival: string;
    departureTime: string;
    arrivalTime: string;
    durationMinutes: string;
  };
  classes: {
    flightNumber: string;
    className: string;
    seatsTotal: string;
    basePrice: string;
  };
  availability: {
    flightNumber: string;
    className: string;
    date: string;
    availableSeats: string;
    price: string;
  };
  classNames: Record<string, string>;
};

const LABELS: Record<FlightReportLocale, FlightWorkbookLabels> = {
  fr: {
    sheets: {
      catalog: 'Catalogue vols',
      classes: 'Classes cabine',
      availability: 'Disponibilités',
    },
    catalog: {
      id: 'ID',
      flightNumber: 'Code vol',
      airline: 'Compagnie',
      airlineIata: 'IATA compagnie',
      departure: 'Départ',
      arrival: 'Arrivée',
      departureTime: 'Heure départ',
      arrivalTime: 'Heure arrivée',
      durationMinutes: 'Durée (min)',
    },
    classes: {
      flightNumber: 'Code vol',
      className: 'Cabine',
      seatsTotal: 'Sièges totaux',
      basePrice: 'Prix de base',
    },
    availability: {
      flightNumber: 'Code vol',
      className: 'Cabine',
      date: 'Date',
      availableSeats: 'Sièges disponibles',
      price: 'Prix',
    },
    classNames: {
      economy: 'Économique',
      premium_economy: 'Premium économique',
      business: 'Affaires',
      first: 'Première',
    },
  },
  en: {
    sheets: {
      catalog: 'Flight catalog',
      classes: 'Cabin classes',
      availability: 'Availability',
    },
    catalog: {
      id: 'ID',
      flightNumber: 'Flight code',
      airline: 'Airline',
      airlineIata: 'Airline IATA',
      departure: 'Departure',
      arrival: 'Arrival',
      departureTime: 'Departure time',
      arrivalTime: 'Arrival time',
      durationMinutes: 'Duration (min)',
    },
    classes: {
      flightNumber: 'Flight code',
      className: 'Cabin',
      seatsTotal: 'Total seats',
      basePrice: 'Base price',
    },
    availability: {
      flightNumber: 'Flight code',
      className: 'Cabin',
      date: 'Date',
      availableSeats: 'Available seats',
      price: 'Price',
    },
    classNames: {
      economy: 'Economy',
      premium_economy: 'Premium economy',
      business: 'Business',
      first: 'First',
    },
  },
  es: {
    sheets: {
      catalog: 'Catálogo de vuelos',
      classes: 'Clases de cabina',
      availability: 'Disponibilidad',
    },
    catalog: {
      id: 'ID',
      flightNumber: 'Código de vuelo',
      airline: 'Aerolínea',
      airlineIata: 'IATA aerolínea',
      departure: 'Salida',
      arrival: 'Llegada',
      departureTime: 'Hora de salida',
      arrivalTime: 'Hora de llegada',
      durationMinutes: 'Duración (min)',
    },
    classes: {
      flightNumber: 'Código de vuelo',
      className: 'Cabina',
      seatsTotal: 'Asientos totales',
      basePrice: 'Precio base',
    },
    availability: {
      flightNumber: 'Código de vuelo',
      className: 'Cabina',
      date: 'Fecha',
      availableSeats: 'Asientos disponibles',
      price: 'Precio',
    },
    classNames: {
      economy: 'Económica',
      premium_economy: 'Económica premium',
      business: 'Business',
      first: 'Primera',
    },
  },
};

export function getFlightWorkbookLabels(locale: FlightReportLocale): FlightWorkbookLabels {
  return LABELS[locale];
}

export function flightClassLabel(
  labels: FlightWorkbookLabels,
  className: string,
): string {
  return labels.classNames[className] ?? className;
}

export function flightWorkbookFilename(dateFrom: string, dateTo: string): string {
  const from = dateFrom.slice(0, 10);
  const to = dateTo.slice(0, 10);
  return `vols-${from}_${to}.xlsx`;
}
