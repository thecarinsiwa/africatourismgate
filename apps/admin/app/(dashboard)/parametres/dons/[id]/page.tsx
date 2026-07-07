import type { Metadata } from 'next';
import { Suspense } from 'react';
import { DonationEditPage } from '../../../../../components/parametres/donation-edit-page';
import { AdminPageLoading } from '../../../../../components/pages/admin-page-loading';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('parametres/dons/edit');
}

export default async function EditDonPage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <DonationEditPage mode="edit" donationId={id} />
    </Suspense>
  );
}
