'use client';

import { SUPPORT_FAQ_KEYS, type SupportFaqKey } from '../../lib/support/faq-items';
import { useTranslations } from '../../lib/i18n/locale-provider';

export function SupportFaq() {
  const t = useTranslations();
  const s = t.support;

  return (
    <section aria-labelledby="support-faq-heading">
      <h2
        id="support-faq-heading"
        className="text-lg font-semibold text-gray-900 dark:text-white"
      >
        {s.faqTitle}
      </h2>
      <ul className="mt-4 divide-y divide-gray-200 rounded-lg border border-gray-200 dark:divide-atg-border dark:border-atg-border">
        {SUPPORT_FAQ_KEYS.map((key: SupportFaqKey) => {
          const item = s.faq[key];
          return (
            <li key={key}>
              <details className="group">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-gray-900 marker:content-none hover:bg-gray-50 dark:text-white dark:hover:bg-white/5 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-center justify-between gap-3">
                    {item.question}
                    <span
                      className="shrink-0 text-primary transition-transform group-open:rotate-180"
                      aria-hidden
                    >
                      ▾
                    </span>
                  </span>
                </summary>
                <p className="border-t border-gray-100 px-4 py-3 text-sm text-gray-600 dark:border-atg-border dark:text-atg-muted">
                  {item.answer}
                </p>
              </details>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
