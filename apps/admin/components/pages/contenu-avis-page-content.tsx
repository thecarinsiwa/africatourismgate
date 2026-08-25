'use client';

import { ReviewsList } from '../reviews/reviews-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function AvisPageContent() {
  return (
    <div className="min-w-0">
      <AdminListPageHeader routePath="contenu/avis" />
      <ReviewsList />
    </div>
  );
}
