import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../components/admin-page-intro';
import { PaymentsPromoSubnav } from '../../../components/payments/payments-promo-subnav';
import { PaymentsList } from '../../../components/payments/payments-list';
import { PaymentsStatCards } from '../../../components/payments/payments-stat-cards';

export const metadata: Metadata = {
  title: 'Paiements — Africa Tourism Gate Admin',
};

export default function PaiementsPage() {
  return (
    <div>
      <PaymentsPromoSubnav />
      <AdminPageIntro description="Transactions et remboursements Stripe (mode test). Filtres par statut, dates et organisation (super admin). Accès : payments.read ; remboursement : payments.write." />
      <PaymentsStatCards className="mb-6" />
      <PaymentsList />
    </div>
  );
}
