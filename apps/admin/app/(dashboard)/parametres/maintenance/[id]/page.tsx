import type { Metadata } from 'next';
import { Suspense } from 'react';
import { MaintenanceEditPage } from '../../../../../components/parametres/maintenance-edit-page';
import { AdminPageLoading } from '../../../../../components/pages/admin-page-loading';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('parametres/maintenance/edit');
}

export default async function EditMaintenancePage({ params }: PageProps) {
  const { id } = await params;
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <MaintenanceEditPage mode="edit" maintenanceId={id} />
    </Suspense>
  );
}
