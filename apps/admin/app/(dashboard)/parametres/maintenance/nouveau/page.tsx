import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MaintenanceEditPage } from '../../../../../components/parametres/maintenance-edit-page';
import { AdminPageLoading } from '../../../../../components/pages/admin-page-loading';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('parametres/maintenance/nouveau');
}

export default function NouveauMaintenancePage() {
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <MaintenanceEditPage mode="create" />
    </Suspense>
  );
}
