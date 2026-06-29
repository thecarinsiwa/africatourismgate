'use client';

import { Accordion } from '../shared/accordion';
import { SUPPORT_FAQ_KEYS, type SupportFaqKey } from '../../lib/support/faq-items';
import { useTranslations } from '../../lib/i18n/locale-provider';

export function SupportFaq() {
  const t = useTranslations();
  const s = t.support;

  const items = SUPPORT_FAQ_KEYS.map((key: SupportFaqKey) => {
    const item = s.faq[key];
    return {
      id: key,
      title: item.question,
      content: <p className="m-0">{item.answer}</p>,
    };
  });

  return (
    <section aria-labelledby="support-faq-heading">
      <h2
        id="support-faq-heading"
        className="text-lg font-semibold text-atg-fg"
      >
        {s.faqTitle}
      </h2>
      <Accordion
        items={items}
        className="mt-4 rounded-lg border border-atg-border dark:border-atg-border"
      />
    </section>
  );
}
