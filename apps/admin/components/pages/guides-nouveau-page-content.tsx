'use client';

import { TourGuideForm } from '../tour-guides/tour-guide-form';
import { AdminListPageHeader } from './admin-list-page-header';

export function GuidesNouveauPageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="guides/nouveau" titleKey="metaTitle" />
      <TourGuideForm mode="create" />
    </div>
  );
}
