import type { Metadata } from 'next';
import { AdminPageLoading } from '../../../components/pages/admin-page-loading';
import { getAdminPageMetadata } from '../../../lib/i18n/admin-page-i18n';
import { Suspense } from 'react';
import { OrganizationSettingsPage } from '../../../components/parametres/organization-settings-page';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('parametres');
}

export default function ParametresPage() {
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <OrganizationSettingsPage />
    </Suspense>
  );
}
