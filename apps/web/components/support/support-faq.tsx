'use client';

import { useTranslations } from 'next-intl';
import { Accordion } from '../shared/accordion';
import { SUPPORT_FAQ_KEYS, type SupportFaqKey } from '../../lib/support/faq-items';

export function SupportFaq() {
  const t = useTranslations('support');

  const items = SUPPORT_FAQ_KEYS.map((key: SupportFaqKey) => ({
    id: key,
    title: t(`faq.${key}.question`),
    content: <p className="m-0">{t(`faq.${key}.answer`)}</p>,
  }));

  return (
    <section aria-labelledby="support-faq-heading">
      <h2
        id="support-faq-heading"
        className="text-lg font-semibold text-atg-fg"
      >
        {t('faqTitle')}
      </h2>
      <Accordion
        items={items}
        className="mt-4 rounded-lg border border-atg-border dark:border-atg-border"
      />
    </section>
  );
}
