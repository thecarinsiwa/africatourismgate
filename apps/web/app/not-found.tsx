import Link from 'next/link';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('notFound');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h2 className="text-xl font-semibold text-slate-900">{t('title')}</h2>
      <Link
        href="/"
        className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        {t('backHome')}
      </Link>
    </main>
  );
}
