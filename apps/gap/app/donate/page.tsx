import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { DonationsListSection } from '@/components/donations-list-section';
import { getPublicDonationsForLocale } from '@/lib/api/public-donations';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('donate');
  return {
    title: t('title'),
    description: t('intro'),
  };
}

export default async function DonatePage() {
  const locale = await getLocale();
  const t = await getTranslations('donate');
  const donations = await getPublicDonationsForLocale(locale, 'gap').catch(() => ({
    navbarFeatured: null,
    items: [],
  }));

  return (
    <main>
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold text-atg-fg sm:text-4xl">{t('title')}</h1>
        <p className="mt-4 text-base leading-relaxed text-atg-muted">{t('intro')}</p>
      </div>
      {donations.items.length > 0 ? (
        <DonationsListSection items={donations.items} allCampaignsLabel={t('allCampaigns')} />
      ) : (
        <p className="px-4 pb-12 text-center text-sm text-atg-muted sm:px-6">{t('empty')}</p>
      )}
    </main>
  );
}
