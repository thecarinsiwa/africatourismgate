import type { Metadata } from 'next';
import { AdminPageIntro } from '../../../../components/admin-page-intro';
import { ReviewsList } from '../../../../components/reviews/reviews-list';

export const metadata: Metadata = {
  title: 'Avis — Africa Tourism Gate Admin',
};

export default function ReviewsPage() {
  return (
    <div>
      <AdminPageIntro description={"Modération des notes et commentaires clients. Filtres par note, propriété et statut.\r\n          Actions : approuver, masquer ou supprimer. Accès : reviews.read / reviews.write."} />
      <ReviewsList />
    </div>
  );
}
