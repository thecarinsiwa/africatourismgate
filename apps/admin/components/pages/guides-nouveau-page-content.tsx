'use client';

import { TourGuideForm } from '../tour-guides/tour-guide-form';
import { AdminIntroPage } from './admin-intro-page';

export function GuidesNouveauPageContent() {
  return (
    <AdminIntroPage
      routePath="guides/nouveau"
      backHref="/guides"
      backLabelKey="backLabel"
    >
      <TourGuideForm mode="create" />
    </AdminIntroPage>
  );
}
