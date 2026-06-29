import type { FlightClassName } from '@africatourismgate/types';
import type { ProductGalleryImage } from '../shared/product-images';

export interface PublicAirport {
  iataCode: string;
  name: string;
  city: string;
  countryCode: string;
}

export interface FlightSearchQuery {
  from?: string;
  to?: string;
  departureDate?: string;
  returnDate?: string;
  passengers?: number;
  page?: number;
  limit?: number;
}

export interface FlightSearchResult {
  id: string;
  flightNumber: string;
  airlineName: string;
  airlineIataCode: string;
  departureAirportIata: string;
  departureAirportCity: string;
  arrivalAirportIata: string;
  arrivalAirportCity: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  minPriceCents: number;
  currency: string;
  roundTrip: boolean;
  departureDate?: string;
  imageUrl?: string | null;
}

export interface FlightDetailQuery {
  departureDate: string;
  returnDate?: string;
  passengers?: number;
}

export interface FlightDetailAirport {
  iataCode: string;
  name: string;
  city: string;
  countryCode: string;
}

/** Escale intermédiaire — optionnel tant que l'API ne l'expose pas. */
export interface FlightLayover {
  airport: FlightDetailAirport;
  durationMinutes: number;
}

export interface FlightDetailClass {
  id: string;
  className: FlightClassName;
  priceCents: number;
  availableSeats: number;
  totalPriceCents: number;
}

export interface FlightDetail {
  id: string;
  flightNumber: string;
  airlineName: string;
  airlineIataCode: string;
  departureAirport: FlightDetailAirport;
  arrivalAirport: FlightDetailAirport;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  departureDate: string;
  returnDate: string | null;
  passengers: number;
  minPriceCents: number;
  currency: string;
  classes: FlightDetailClass[];
  /** Escales intermédiaires — absent ou vide = vol direct. */
  layovers?: FlightLayover[];
  images?: ProductGalleryImage[];
}
