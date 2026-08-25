'use client';

import { UserForm } from '../users/user-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauUtilisateurPageContent() {
  return (
    <AdminIntroPage
      routePath="utilisateurs/nouveau"
      backHref="/utilisateurs"
      backLabelKey="backLabel"
    >
      <UserForm mode="create" />
    </AdminIntroPage>
  );
}
