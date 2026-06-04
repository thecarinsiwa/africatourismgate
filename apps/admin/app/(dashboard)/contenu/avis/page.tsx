import type { Metadata } from 'next';
import { ReviewsList } from '../../../../components/reviews/reviews-list';

export const metadata: Metadata = {
  title: 'Avis — Africa Tourism Gate Admin',
};

export default function ReviewsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Avis</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Modération des notes et commentaires clients. Filtres par note, propriété et statut.
          Actions : approuver, masquer ou supprimer. Accès : reviews.read / reviews.write.
        </p>
      </div>
      <ReviewsList />
    </div>
  );
}
