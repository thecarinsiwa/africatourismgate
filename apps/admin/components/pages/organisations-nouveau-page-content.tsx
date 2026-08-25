'use client';

import { OrganizationForm } from '../organizations/organization-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouvelleOrganisationPageContent() {
  return (
    <AdminIntroPage
      routePath="organisations/nouveau"
      backHref="/organisations"
      backLabelKey="backLabel"
    >
      <div className="min-w-0">
        <OrganizationForm mode="create" />
      </div>
    </AdminIntroPage>
  );
}
