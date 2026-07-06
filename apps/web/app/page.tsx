import type { Metadata } from 'next';
import { HomeFooter } from '../components/home/home-footer';
import { HomeHeader } from '../components/home/home-header';
import { HeroSlider } from '../components/home/hero-search';
import { SearchTabs } from '../components/home/search-tabs';
import { WhyUsSection } from '../components/home/verticals-section';
import { ParallaxPromo } from '../components/home/parallax-promo';
import { DestinationsCarousel } from '../components/home/destinations-carousel';
import { HappyCustomers } from '../components/home/happy-customers';
import { ActivitiesMapSection } from '../components/home/activities-map-section';
import { CustomerReviewsCarousel } from '../components/home/customer-reviews-carousel';

type PublicBranding = {
  displayName?: string;
};

async function getPublicDisplayName(): Promise<string> {
  const defaultApiUrl =
    process.env.NODE_ENV === 'production'
      ? 'https://app-africatourismgate.org/api'
      : 'http://localhost:3000/api';
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL ?? defaultApiUrl).replace(/\/$/, '');

  try {
    const response = await fetch(`${apiUrl}/organization-settings/public/branding`, {
      cache: 'no-store',
    });
    if (!response.ok) return 'Africa Tourism Gate';
    const branding = (await response.json()) as PublicBranding;
    return branding.displayName?.trim() || 'Africa Tourism Gate';
  } catch {
    return 'Africa Tourism Gate';
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const siteName = await getPublicDisplayName();
  return {
    title: 'Réservez votre voyage en Afrique',
    description: `Comparez hôtels, vols et expériences en Afrique. Recherchez des hébergements et planifiez votre prochain séjour avec ${siteName}.`,
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
        <DestinationsCarousel />
        <HappyCustomers />
        <ActivitiesMapSection />
        <CustomerReviewsCarousel />
      </main>

      <HomeFooter />
    </div>
  );
}
