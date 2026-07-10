'use client';

import { Suspense } from 'react';
import { UsersList } from '../users/users-list';
import { UsersStatCards } from '../users/users-stat-cards';
import { AdminIntroPage } from './admin-intro-page';
import { AdminPageLoading } from './admin-page-loading';

export function UtilisateursPageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs">
      <UsersStatCards className="mb-6" />
      <Suspense fallback={<AdminPageLoading />}>
        <UsersList />
      </Suspense>
    </AdminIntroPage>
  );
}
