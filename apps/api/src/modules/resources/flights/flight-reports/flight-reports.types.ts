import type { EmailBrandingValue } from '@africatourismgate/types';
import type { Flights } from '../../../../entities/generated';
import type { FlightReportLocale } from './labels/flight-reports.labels';

export type ScopedFlightRow = Flights & {
  airlineName: string;
  airlineIata: string;
  departureAirportIata: string;
  departureAirportCity: string;
  arrivalAirportIata: string;
  arrivalAirportCity: string;
};

export type FlightReportScope = {
  flightIds: string[];
  flights: ScopedFlightRow[];
};

export type FlightPdfBrandingContext = {
  locale: FlightReportLocale;
  branding: EmailBrandingValue;
  logoPath: string | Buffer | null;
  exportedAt: Date;
};
