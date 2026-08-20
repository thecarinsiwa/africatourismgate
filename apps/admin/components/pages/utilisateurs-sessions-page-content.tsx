'use client';

import { UserSessionsList } from '../users/user-sessions-list';
import { UserSessionsStatCards } from '../users/user-sessions-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function SessionsPageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs/sessions">
      <UserSessionsStatCards className="mb-6" />
      <UserSessionsList />
    </AdminIntroPage>
  );
}
