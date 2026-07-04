import type { EmailBrandingValue } from '@africatourismgate/types';
import type { BookingDetailPdfLocale } from './booking-detail-pdf.labels';

export type BookingDetailPdfItem = {
  title: string;
  itemType: string;
  quantity: number;
  unitPriceCents: number;
  startDate: string | null;
  endDate: string | null;
};

export type BookingDetailPdfTraveler = {
  fullName: string;
  age?: number | null;
  priceCents?: number | null;
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
  visitStartDate: string | null;
  visitEndDate: string | null;
  chatUrl: string;
  accountUrl: string;
  locale: BookingDetailPdfLocale;
  branding: EmailBrandingValue;
  logoPath?: string | Buffer | null;
  generatedAt: string;
};
