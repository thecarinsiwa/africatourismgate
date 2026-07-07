'use client';

import { useTranslations } from 'next-intl';

export function GapFooter() {
  const t = useTranslations('footer');
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-atg-border bg-gap-forest text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-md space-y-2">
          <p className="text-lg font-semibold">Gorilla Ambassadors Program</p>
          <p className="text-sm text-white/75">{t('tagline')}</p>
        </div>
        <div className="space-y-2 text-sm text-white/80">
          <p>
            <a
              href="https://africatourismgate.org"
              className="underline decoration-white/30 underline-offset-4 hover:text-white"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('mainSite')}
            </a>
          </p>
          <p className="text-white/60">
            © {year} GAP — {t('rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
