'use client';

import en from '../messages/en.json';
import es from '../messages/es.json';
import fr from '../messages/fr.json';

type ErrorMessages = {
  title: string;
  unexpected: string;
  critical: string;
  tryAgain: string;
};

function resolveErrorMessages(): ErrorMessages {
  if (typeof document === 'undefined') return fr.errors;
  const lang = document.documentElement.lang;
  if (lang === 'en') return en.errors;
  if (lang === 'es') return es.errors;
  return fr.errors;
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = resolveErrorMessages();

  return (
    <html lang={typeof document !== 'undefined' ? document.documentElement.lang : 'fr'}>
      <body className="flex min-h-screen flex-col items-center justify-center bg-white p-8 font-sans">
        <h2 className="text-xl font-semibold text-slate-900">{t.title}</h2>
        <p className="mt-2 max-w-md text-center text-sm text-slate-600">
          {error.message || t.critical}
        </p>
        <button
          type="button"
          onClick={() => reset()}
          className="mt-6 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          {t.tryAgain}
        </button>
      </body>
    </html>
  );
}
