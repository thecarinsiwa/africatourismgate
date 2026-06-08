import type { Metadata } from 'next';
import { UserPaymentMethodsList } from '../../../../components/users/user-payment-methods-list';

export const metadata: Metadata = {
  title: 'Moyens de paiement — Africa Tourism Gate Admin',
};

export default function UtilisateurMoyensPaiementPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Moyens de paiement</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Cartes et moyens de paiement enregistrés par les utilisateurs.
        </p>
      </div>
      <UserPaymentMethodsList />
    </div>
  );
}
