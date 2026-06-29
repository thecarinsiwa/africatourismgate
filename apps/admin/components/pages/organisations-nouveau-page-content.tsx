'use client';

import { OrganizationForm } from '../organizations/organization-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouvelleOrganisationPageContent() {
  return (
    <AdminIntroPage routePath="organisations/nouveau">
      <OrganizationForm mode="create" />
    </AdminIntroPage>
  );
}
