import type { EmailBrandingValue } from '@africatourismgate/types';
import type { Vehicles } from '../../../../entities/generated';
import type { VehicleReportLocale } from './labels/vehicle-reports.labels';

export type ScopedVehicleRow = Vehicles & {
  agencyName: string;
  categoryName: string;
  categoryExampleModel: string;
};

export type VehicleReportScope = {
  vehicleIds: string[];
  vehicles: ScopedVehicleRow[];
};

export type VehiclePdfBrandingContext = {
  locale: VehicleReportLocale;
  branding: EmailBrandingValue;
  logoPath: string | Buffer | null;
  exportedAt: Date;
};
