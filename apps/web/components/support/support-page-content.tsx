'use client';

import { useTranslations } from '../../lib/i18n/locale-provider';
import { HomeFooter } from '../home/home-footer';
import { HomeHeader } from '../home/home-header';
import { SupportFaq } from './support-faq';
import { SupportTicketForm } from './support-ticket-form';

export function SupportPageContent() {
  const t = useTranslations();
  const s = t.support;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-[#0a1210]">
      <HomeHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <header className="mb-10">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              {s.pageTitle}
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-atg-muted">{s.pageSubtitle}</p>
          </header>

          <div className="space-y-12">
            <SupportFaq />

            <section aria-labelledby="support-form-heading">
              <h2
                id="support-form-heading"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                {s.formTitle}
              </h2>
              <p className="mt-1 text-sm text-gray-600 dark:text-atg-muted">{s.formSubtitle}</p>
              <div className="mt-4">
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
