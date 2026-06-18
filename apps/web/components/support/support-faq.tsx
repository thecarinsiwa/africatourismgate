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
        className="text-lg font-semibold text-atg-fg"
      >
        {s.faqTitle}
      </h2>
      <ul className="mt-4 divide-y divide-atg-border rounded-lg border border-atg-border dark:divide-atg-border dark:border-atg-border">
        {SUPPORT_FAQ_KEYS.map((key: SupportFaqKey) => {
          const item = s.faq[key];
          return (
            <li key={key}>
              <details className="group">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-atg-fg marker:content-none hover:bg-atg-surface dark:text-white dark:hover:bg-white/5 [&::-webkit-details-marker]:hidden">
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
                <p className="border-t border-atg-border px-4 py-3 text-sm text-atg-muted dark:border-atg-border text-atg-muted">
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
