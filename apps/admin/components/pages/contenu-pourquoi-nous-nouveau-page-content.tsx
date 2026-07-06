'use client';

import { WhyUsItemForm } from '../why-us/why-us-item-form';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuPourquoiNousNouveauPageContent() {
  return (
    <AdminIntroPage routePath="contenu/pourquoi-nous/nouveau">
      <WhyUsItemForm mode="create" />
    </AdminIntroPage>
  );
}
