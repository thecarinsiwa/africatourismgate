'use client';

import { useTranslations } from 'next-intl';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { SupportCategoryGrid } from './support-category-grid';
import { SupportPopularList } from './support-popular-list';
import { SupportQuickStart } from './support-quick-start';
import { SupportSearch } from './support-search';
import { SupportTicketForm } from './support-ticket-form';

export function SupportPageContent() {
  const t = useTranslations('support');

  return (
    <div className="flex min-h-screen flex-col bg-atg-surface dark:bg-atg-surface">
      <HomeHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <header className="mb-8 max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight text-atg-fg sm:text-3xl">
              {t('pageTitle')}
            </h1>
            <p className="mt-2 text-base text-atg-muted sm:text-lg">
              {t('pageSubtitle')}
            </p>
          </header>

          <div className="mb-12 max-w-2xl">
            <SupportSearch />
          </div>

          <div className="space-y-12">
            <SupportQuickStart />
            <SupportCategoryGrid />
            <SupportPopularList />

            <section
              id="support-form"
              aria-labelledby="support-form-heading"
              className="scroll-mt-24"
            >
              <h2
                id="support-form-heading"
                className="text-lg font-semibold text-atg-fg"
              >
                {t('formTitle')}
              </h2>
              <p className="mt-1 text-sm text-atg-muted">{t('formSubtitle')}</p>
              <div className="mt-4 max-w-2xl">
                <SupportTicketForm />
              </div>
            </section>
          </div>
        </div>
      </main>
      <HomeFooter />
    </div>
  );
}
