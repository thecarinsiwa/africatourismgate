import type { Metadata } from 'next';
import { Card } from '@africatourismgate/ui';

export const metadata: Metadata = {
  title: 'Sessions — Africa Tourism Gate Admin',
};

export default function UtilisateurSessionsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-atg-fg">Sessions</h1>
        <p className="mt-2 text-sm text-atg-muted">
          Sessions actives et historique de connexion.
        </p>
      </div>
      <Card className="p-6">
        <p className="text-sm text-atg-muted">
          La liste des sessions utilisateur sera disponible prochainement.
        </p>
      </Card>
    </div>
  );
}
