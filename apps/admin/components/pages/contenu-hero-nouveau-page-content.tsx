'use client';

import { HeroSlideForm } from '../hero-slides/hero-slide-form';
import { AdminIntroPage } from './admin-intro-page';

export function ContenuHeroNouveauPageContent() {
  return (
    <AdminIntroPage routePath="contenu/hero/nouveau">
      <HeroSlideForm mode="create" />
    </AdminIntroPage>
  );
}
