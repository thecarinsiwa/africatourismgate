import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrganizationSettingsPage } from '../../../components/parametres/organization-settings-page';

export const metadata: Metadata = {
  title: 'Paramètres — Africa Tourism Gate Admin',
};

export default function ParametresPage() {
  return (
    <Suspense fallback={<p className="text-sm text-atg-muted">Chargement…</p>}>
      <OrganizationSettingsPage />
    </Suspense>
  );
}
