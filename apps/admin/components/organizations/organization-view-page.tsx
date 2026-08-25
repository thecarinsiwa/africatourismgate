'use client';

import { AdminIntroPage } from '../pages/admin-intro-page';

type OrganizationViewPageProps = {
  organizationId: string;
};

/** Stub — contenu lecture seule à implémenter. */
export function OrganizationViewPage({ organizationId: _organizationId }: OrganizationViewPageProps) {
  return (
    <AdminIntroPage
      routePath="organisations/id/voir"
      backHref="/organisations"
      backLabelKey="backLabel"
      suppressDescription
    />
  );
}
