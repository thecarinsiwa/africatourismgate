import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { LoyaltyAccountsList } from '../../../../components/loyalty/loyalty-accounts-list';

export const metadata: Metadata = {
  title: 'Comptes fidélité — Africa Tourism Gate Admin',
};

export default function LoyaltyAccountsPage() {
  return (
    <div>
      <AdminPageIntro description="Programme OneKey — solde de points, paliers et dernière activité. Ajustement manuel réservé au super administrateur." />
      <LoyaltyAccountsList />
    </div>
  );
}
