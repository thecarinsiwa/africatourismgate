import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { HomeFooter } from '../components/home/home-footer';
import { HomeHeader } from '../components/home/home-header';
import { HeroSlider } from '../components/home/hero-search';
import { SearchTabs } from '../components/home/search-tabs';
import { WhyUsSection } from '../components/home/verticals-section';
import { ParallaxPromo } from '../components/home/parallax-promo';
import { HappyCustomers } from '../components/home/happy-customers';
import { DestinationsMapSection } from '../components/home/destinations-map-section';
import { CustomerReviewsCarousel } from '../components/home/customer-reviews-carousel';
import { PartnersSection } from '../components/home/partners-section';
import { GapImpactSection } from '../components/home/gap-impact-section';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('meta');
  return {
    title: t('homeTitle'),
    description: t('homeDescription'),
  };
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <HomeHeader />

      <main>
        <HeroSlider />
        <SearchTabs />
        <WhyUsSection />
        <ParallaxPromo />
        <DestinationsMapSection />
        <HappyCustomers />
        <CustomerReviewsCarousel />
        <PartnersSection />
        <GapImpactSection />
      </main>

      <HomeFooter />
    </div>
  );
}
