'use client';

import { AboutPagesList } from '../about/about-pages-list';
import { AboutStatCards } from '../about/about-stat-cards';

export function ContenuAboutPagesTabPanel() {
  return (
    <>
      <AboutStatCards className="mb-6" section="pages" />
      <AboutPagesList />
    </>
  );
}
