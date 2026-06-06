import type { Metadata } from 'next';
import { LoyaltyAccountsList } from '../../../../components/loyalty/loyalty-accounts-list';

export const metadata: Metadata = {
  title: 'Comptes fidélité — Africa Tourism Gate Admin',
};

export default function LoyaltyAccountsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Comptes fidélité</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Programme OneKey — solde de points, paliers et dernière activité. Ajustement manuel
          réservé au super administrateur.
        </p>
      </div>
      <LoyaltyAccountsList />
    </div>
  );
}
