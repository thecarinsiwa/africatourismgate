import type { EmailBrandingValue } from '@africatourismgate/types';
import type { Properties } from '../../../../entities/generated';
import type { AccommodationReportLocale } from './labels/accommodation-reports.labels';

export type ScopedPropertyRow = Properties & {
  destinationName: string;
};

export type AccommodationReportScope = {
  propertyIds: string[];
  properties: ScopedPropertyRow[];
};

export type AccommodationPdfBrandingContext = {
  locale: AccommodationReportLocale;
  branding: EmailBrandingValue;
  logoPath: string | Buffer | null;
  exportedAt: Date;
};
