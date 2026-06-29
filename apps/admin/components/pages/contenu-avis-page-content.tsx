'use client';

import { ReviewsList } from '../reviews/reviews-list';
import { AdminIntroPage } from './admin-intro-page';

export function AvisPageContent() {
  return (
    <AdminIntroPage routePath="contenu/avis">
      <ReviewsList />
    </AdminIntroPage>
  );
}
