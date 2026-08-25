'use client';

import { AboutResourcesList } from '../about/about-resources-list';
import { AboutStatCards } from '../about/about-stat-cards';

export function ContenuAboutResourcesTabPanel() {
  return (
    <>
      <AboutStatCards className="mb-6" section="resources" />
      <AboutResourcesList />
    </>
  );
}
