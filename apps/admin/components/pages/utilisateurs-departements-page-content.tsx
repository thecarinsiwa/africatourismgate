'use client';

import { DepartmentsList } from '../departments/departments-list';
import { AdminIntroPage } from './admin-intro-page';

export function DepartementsPageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs/departements">
      <DepartmentsList />
    </AdminIntroPage>
  );
}
