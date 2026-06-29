'use client';

import { UserPaymentMethodsList } from '../users/user-payment-methods-list';
import { AdminIntroPage } from './admin-intro-page';

export function MoyensPaiementPageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs/moyens-paiement">
      <UserPaymentMethodsList />
    </AdminIntroPage>
  );
}
