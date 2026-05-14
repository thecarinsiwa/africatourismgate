import { isNonEmptyString } from '@africatourismgate/utils';

export default function HomePage() {
  const title = isNonEmptyString('Africa Tourism Gate') ? 'Africa Tourism Gate' : 'ATG';
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      <p className="mt-4 text-slate-600">Public site — Next.js app (`apps/web`). Port 3002.</p>
    </main>
  );
}
