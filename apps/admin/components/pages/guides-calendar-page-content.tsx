'use client';

import { TourGuidesCalendarView } from '../tour-guides/tour-guides-calendar-view';
import { AdminIntroPage } from './admin-intro-page';

export function GuidesCalendarPageContent() {
  return (
    <AdminIntroPage
      routePath="guides/calendrier"
      backHref="/guides"
      backLabelKey="backLabel"
    >
      <TourGuidesCalendarView />
    </AdminIntroPage>
  );
}
