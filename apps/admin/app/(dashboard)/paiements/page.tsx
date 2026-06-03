import type { Metadata } from 'next';
import { PaymentsList } from '../../../components/payments/payments-list';

export const metadata: Metadata = {
  title: 'Paiements — Africa Tourism Gate Admin',
};

export default function PaiementsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Paiements</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Transactions et remboursements Stripe (mode test). Filtres par statut, dates et
          organisation (super admin). Accès : payments.read ; remboursement : payments.write.
        </p>
      </div>
      <PaymentsList />
    </div>
  );
}
