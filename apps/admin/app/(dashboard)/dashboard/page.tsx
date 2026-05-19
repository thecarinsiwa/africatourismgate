import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tableau de bord — Africa Tourism Gate Admin',
};

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <h1 className="text-2xl font-bold text-atg-fg">Tableau de bord</h1>
      <p className="mt-2 text-sm text-atg-muted">Connexion réussie.</p>
    </main>
  );
}
