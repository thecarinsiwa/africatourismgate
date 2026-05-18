import { getAdminAppUrl } from '@africatourismgate/utils';

export default function AdminHome() {
  const adminUrl = getAdminAppUrl();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-3xl font-bold text-slate-900">Admin</h1>
      <p className="mt-4 text-slate-600">
        Back office —{' '}
        <a href={adminUrl} className="text-primary underline">
          {adminUrl}
        </a>
      </p>
    </main>
  );
}
