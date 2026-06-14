import type { Metadata } from 'next';
import { Suspense } from 'react';
import { PropertyEditPage } from '../../../../components/properties/property-edit-page';

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Modifier l’hébergement — Africa Tourism Gate Admin',
};

export default function EditHebergementPage({ params }: PageProps) {
  return (
    <Suspense fallback={<p className="text-sm text-atg-muted">Chargement…</p>}>
      <PropertyEditPage propertyId={params.id} />
    </Suspense>
  );
}
