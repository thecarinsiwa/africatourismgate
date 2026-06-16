'use client';

import { DestinationForm } from '../destinations/destination-form';
import { AdminListPageHeader } from './admin-list-page-header';

export function NouvelleDestinationPageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="produits/destinations/nouveau" titleKey="metaTitle" />
      <DestinationForm mode="create" />
    </div>
  );
}
