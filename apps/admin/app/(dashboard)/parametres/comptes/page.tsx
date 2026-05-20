import type { Metadata } from 'next';
import { Suspense } from 'react';
import { OrganizationBankAccountsList } from '../../../../components/parametres/organization-bank-accounts-list';

export const metadata: Metadata = {
  title: 'Comptes bancaires — Africa Tourism Gate Admin',
};

export default function ParametresComptesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-atg-muted">Chargement…</p>}>
      <OrganizationBankAccountsList />
    </Suspense>
  );
}
