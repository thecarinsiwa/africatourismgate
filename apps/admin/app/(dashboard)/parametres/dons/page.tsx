import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DonationsList } from '../../../../components/parametres/donations-list';
import { AdminPageLoading } from '../../../../components/pages/admin-page-loading';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('parametres/dons');
}

export default function ParametresDonsPage() {
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <DonationsList />
    </Suspense>
  );
}
