'use client';

import { CruisePortsList } from '../cruises/cruise-ports-list';
import { AdminIntroPage } from './admin-intro-page';

export function PortsCroisierePageContent() {
  return (
    <AdminIntroPage routePath="produits/croisieres/ports">
      <CruisePortsList />
    </AdminIntroPage>
  );
}
