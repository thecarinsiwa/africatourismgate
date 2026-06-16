'use client';

import { UsersList } from '../users/users-list';
import { UsersStatCards } from '../users/users-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function UtilisateursPageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs">
      <UsersStatCards className="mb-6" />
      <UsersList />
    </AdminIntroPage>
  );
}
