import type { Metadata } from 'next';
import { PageHeader } from '@africatourismgate/ui';
import { LoyaltyAccountsList } from '../../../../components/loyalty/loyalty-accounts-list';

export const metadata: Metadata = {
  title: 'Comptes fidélité — Africa Tourism Gate Admin',
};

export default function LoyaltyAccountsPage() {
  return (
    <div>
      <PageHeader
        title="Comptes fidélité"
        description="Programme OneKey — solde de points, paliers et dernière activité. Ajustement manuel réservé au super administrateur."
      />
      <LoyaltyAccountsList />
    </div>
  );
}
