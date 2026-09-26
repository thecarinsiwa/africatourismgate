import type { Metadata } from 'next';
import { TresorerieComptabiliteGrandLivrePageContent } from '../../../../../components/pages/tresorerie-comptabilite-grand-livre-page-content';
import { getAdminPageMetadata } from '../../../../../lib/i18n/admin-page-i18n';

type Props = {
  searchParams: { accountId?: string };
};

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('tresorerie/comptabilite/grand-livre');
}

export default function TresorerieComptabiliteGrandLivrePage({
  searchParams,
}: Props) {
  return (
    <TresorerieComptabiliteGrandLivrePageContent
      initialAccountId={searchParams.accountId}
    />
  );
}
