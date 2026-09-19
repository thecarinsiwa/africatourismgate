import type { Metadata } from 'next';
import { AdminPageLoading } from '../../../../components/pages/admin-page-loading';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { Suspense } from 'react';
import { MobileMoneyConfigPage } from '../../../../components/parametres/mobile-money-config-page';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('parametres/mobile-money');
}

export default function ParametresMobileMoneyPage() {
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <MobileMoneyConfigPage />
    </Suspense>
  );
}
