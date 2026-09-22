import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminPageLoading } from '../../../../components/pages/admin-page-loading';
import { MaintenanceSettingsPage } from '../../../../components/parametres/maintenance-settings-page';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('parametres/maintenance');
}

export default function ParametresMaintenancePage() {
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <MaintenanceSettingsPage />
    </Suspense>
  );
}
