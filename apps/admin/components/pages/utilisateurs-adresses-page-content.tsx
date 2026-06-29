'use client';

import { UserAddressesList } from '../users/user-addresses-list';
import { AdminIntroPage } from './admin-intro-page';

export function AdressesPageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs/adresses">
      <UserAddressesList />
    </AdminIntroPage>
  );
}
