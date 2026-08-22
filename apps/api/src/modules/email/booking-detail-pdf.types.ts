import type { EmailBrandingValue } from '@africatourismgate/types';
import type { BookingDetailPdfLocale } from './booking-detail-pdf.labels';

export type BookingDetailPdfItem = {
  title: string;
  itemType: string;
  quantity: number;
  unitPriceCents: number;
  startDate: string | null;
  endDate: string | null;
  schedule: string | null;
};

export type BookingDetailPdfTraveler = {
  fullName: string;
  age?: number | null;
  sex?: 'M' | 'F' | 'other' | null;
  nationality?: string | null;
  idNumber?: string | null;
  priceCents?: number | null;
  conditions?: string | null;
  comment?: string | null;
  other?: string | null;
};

export type BookingDetailPdfItineraryStep = {
  order: number;
  label: string;
  detail?: string | null;
};

export type BookingDetailPdfItineraryGroup = {
  title: string;
  itemType: string;
  steps: BookingDetailPdfItineraryStep[];
};

export type BookingDetailPdfGuide = {
  name: string;
  role: 'primary' | 'secondary';
  schedule: string;
};

export type BookingDetailPdfPayment = {
  amountCents: number;
  currency: string;
  status: string;
  provider: string;
  createdAt: string;
};

export type BookingDetailPdfInput = {
  bookingId: string;
  status: string;
  totalCents: number;
  currency: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
  };
  items: BookingDetailPdfItem[];
  travelers: BookingDetailPdfTraveler[];
  itinerary: BookingDetailPdfItineraryGroup[];
  guides: BookingDetailPdfGuide[];
  payments: BookingDetailPdfPayment[];
  bookingCreatedAt: string;
  visitStartDate: string | null;
  visitEndDate: string | null;
  chatUrl: string;
  accountUrl: string;
  locale: BookingDetailPdfLocale;
  branding: EmailBrandingValue;
  logoPath?: string | Buffer | null;
  generatedAt: string;
};
