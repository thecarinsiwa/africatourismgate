'use client';

import { UserSessionsList } from '../users/user-sessions-list';
import { AdminIntroPage } from './admin-intro-page';

export function SessionsPageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs/sessions">
      <UserSessionsList />
    </AdminIntroPage>
  );
}
