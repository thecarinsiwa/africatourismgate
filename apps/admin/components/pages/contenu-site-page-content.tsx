'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { useId, useMemo } from 'react';
import { useAdminTabFromUrl } from '../../lib/use-admin-tab-from-url';
import { AdminIntroPage } from './admin-intro-page';
import { ContenuAboutPagesTabPanel } from './contenu-about-pages-tab-panel';
import { ContenuAboutResourcesTabPanel } from './contenu-about-resources-tab-panel';
import { ContenuAboutTeamTabPanel } from './contenu-about-team-tab-panel';
import { ContenuAboutTimelineTabPanel } from './contenu-about-timeline-tab-panel';
import { ContenuAnnouncementBannerTabPanel } from './contenu-announcement-banner-tab-panel';
import { ContenuFooterTabPanel } from './contenu-footer-tab-panel';
import { ContenuHappyCustomersTabPanel } from './contenu-happy-customers-tab-panel';
import { ContenuHeroTabPanel } from './contenu-hero-tab-panel';
import { ContenuHomepageReviewsTabPanel } from './contenu-homepage-reviews-tab-panel';
import { ContenuWhyUsTabPanel } from './contenu-why-us-tab-panel';

const SITE_TABS = [
  'about-pages',
  'about-team',
  'about-timeline',
  'about-resources',
  'why-us',
  'hero',
  'happy-customers',
  'announcement-banner',
  'footer',
  'homepage-reviews',
] as const;

type SiteTab = (typeof SITE_TABS)[number];

export function ContenuSitePageContent() {
  const t = useTranslations('pages.contenu.site');
  const { activeTab, setActiveTab } = useAdminTabFromUrl(SITE_TABS, 'about-pages');
  const mobileSelectId = useId();

  const tabOptions = useMemo(
    () =>
      [
        { value: 'about-pages' as const, label: t('tabs.aboutPages') },
        { value: 'about-team' as const, label: t('tabs.aboutTeam') },
        { value: 'about-timeline' as const, label: t('tabs.aboutTimeline') },
        { value: 'about-resources' as const, label: t('tabs.aboutResources') },
        { value: 'why-us' as const, label: t('tabs.whyUs') },
        { value: 'hero' as const, label: t('tabs.hero') },
        { value: 'happy-customers' as const, label: t('tabs.happyCustomers') },
        { value: 'announcement-banner' as const, label: t('tabs.announcementBanner') },
        { value: 'footer' as const, label: t('tabs.footer') },
        { value: 'homepage-reviews' as const, label: t('tabs.homepageReviews') },
      ] satisfies { value: SiteTab; label: string }[],
    [t],
  );

  return (
    <AdminIntroPage routePath="contenu/site">
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as SiteTab)}
        className="space-y-6"
      >
        <div className="md:hidden">
          <label htmlFor={mobileSelectId} className="mb-1.5 block text-sm font-medium text-atg-fg">
            {t('tabsAria')}
          </label>
          <select
            id={mobileSelectId}
            value={activeTab}
            onChange={(event) => setActiveTab(event.target.value as SiteTab)}
            className="w-full rounded-md border border-atg-border bg-atg-elevated px-3 py-2.5 text-sm text-atg-fg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {tabOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <TabsList
          aria-label={t('tabsAria')}
          className="hidden h-auto max-w-full flex-wrap md:flex"
        >
          {tabOptions.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="about-pages">
          <ContenuAboutPagesTabPanel />
        </TabsContent>

        <TabsContent value="about-team">
          <ContenuAboutTeamTabPanel />
        </TabsContent>

        <TabsContent value="about-timeline">
          <ContenuAboutTimelineTabPanel />
        </TabsContent>

        <TabsContent value="about-resources">
          <ContenuAboutResourcesTabPanel />
        </TabsContent>

        <TabsContent value="why-us">
          <ContenuWhyUsTabPanel />
        </TabsContent>

        <TabsContent value="hero">
          <ContenuHeroTabPanel />
        </TabsContent>

        <TabsContent value="happy-customers">
          <ContenuHappyCustomersTabPanel />
        </TabsContent>

        <TabsContent value="announcement-banner">
          <ContenuAnnouncementBannerTabPanel />
        </TabsContent>

        <TabsContent value="footer">
          <ContenuFooterTabPanel />
        </TabsContent>

        <TabsContent value="homepage-reviews">
          <ContenuHomepageReviewsTabPanel />
        </TabsContent>
      </Tabs>
    </AdminIntroPage>
  );
}
