import type { Metadata } from 'next';
import { AdminPageLoading } from '../../../../components/pages/admin-page-loading';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { Suspense } from 'react';
import { PropertyEditPage } from '../../../../components/properties/property-edit-page';

type PageProps = {
  params: { id: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('hebergements/id');
}

export default function EditHebergementPage({ params }: PageProps) {
  return (
    <Suspense fallback={<AdminPageLoading />}>
      <PropertyEditPage propertyId={params.id} />
    </Suspense>
  );
}
