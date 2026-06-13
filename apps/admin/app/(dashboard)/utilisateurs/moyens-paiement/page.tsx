import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { UserPaymentMethodsList } from '../../../../components/users/user-payment-methods-list';

export const metadata: Metadata = {
  title: 'Moyens de paiement — Africa Tourism Gate Admin',
};

export default function UtilisateurMoyensPaiementPage() {
  return (
    <div>
      <AdminPageIntro description={"Cartes et moyens de paiement enregistrés par les utilisateurs."} />
      <UserPaymentMethodsList />
    </div>
  );
}
