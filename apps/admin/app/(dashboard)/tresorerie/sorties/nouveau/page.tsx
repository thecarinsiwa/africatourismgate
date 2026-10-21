import type { Metadata } from 'next';
import { Suspense } from 'react';
import { TresorerieSortiesNouveauPageContent } from '../../../../../components/pages/tresorerie-sorties-nouveau-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/sorties/nouveau');
}

export default function TresorerieSortiesNouveauPage() {
  return (
    <Suspense fallback={null}>
      <TresorerieSortiesNouveauPageContent />
    </Suspense>
  );
}
