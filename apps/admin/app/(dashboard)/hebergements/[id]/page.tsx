import type { Metadata } from 'next';
import { PropertyEditPage } from '../../../../components/properties/property-edit-page';

type PageProps = {
  params: { id: string };
};

export const metadata: Metadata = {
  title: 'Modifier l’hébergement — Africa Tourism Gate Admin',
};

export default function EditHebergementPage({ params }: PageProps) {
  return <PropertyEditPage propertyId={params.id} />;
}
