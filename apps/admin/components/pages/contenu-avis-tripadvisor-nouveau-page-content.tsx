'use client';

import { TripadvisorReviewForm } from '../reviews/tripadvisor-review-form';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuAvisTripadvisorNouveauPageContent() {
  return (
    <AdminIntroPage
      routePath="contenu/avis/tripadvisor/nouveau"
      backHref="/contenu/avis"
      backLabelKey="backLabel"
    >
      <div className="min-w-0">
        <TripadvisorReviewForm />
      </div>
    </AdminIntroPage>
  );
}
