import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DonationEditPage } from '../../../../../components/parametres/donation-edit-page';
import { AdminPageLoading } from '../../../../../components/pages/admin-page-loading';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('parametres/dons/nouveau');
}

export default function NouveauDonPage() {
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <DonationEditPage mode="create" />
    </Suspense>
  );
}
