'use client';

import type { Package } from '@africatourismgate/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { PackageDescriptionAssetsSection } from './package-description-assets-section';
import { PackageForm } from './package-form';
import { PackageImagesSection } from './package-images-section';
import { PackageItemsSection } from './package-items-section';
import { PackagePublicationSection } from './package-publication-section';

const TAB_VALUES = ['informations', 'prestations', 'medias', 'publication'] as const;
type TabValue = (typeof TAB_VALUES)[number];

function isTabValue(value: string | null): value is TabValue {
  return value !== null && (TAB_VALUES as readonly string[]).includes(value);
}

type PackageEditorTabsProps = {
  packageId: string;
  pkg: Package;
  onPackageUpdated: (pkg: Package) => void;
};

export function PackageEditorTabs({ packageId, pkg, onPackageUpdated }: PackageEditorTabsProps) {
  const t = useTranslations('modules.packages.detail.tabs');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabParam = searchParams.get('tab');
  const activeTab: TabValue = isTabValue(tabParam) ? tabParam : 'informations';

  const handleTabChange = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === 'informations') {
        params.delete('tab');
      } else {
        params.set('tab', tab);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList aria-label={t('aria')}>
        <TabsTrigger value="informations">{t('informations')}</TabsTrigger>
        <TabsTrigger value="prestations">{t('prestations')}</TabsTrigger>
        <TabsTrigger value="medias">{t('medias')}</TabsTrigger>
        <TabsTrigger value="publication">{t('publication')}</TabsTrigger>
      </TabsList>

      <TabsContent value="informations">
        <PackageForm
          mode="edit"
          packageId={packageId}
          initialPackage={pkg}
          showAttachmentsSection={false}
          showPublicationSection={false}
        />
      </TabsContent>

      <TabsContent value="prestations">
        <PackageItemsSection packageId={packageId} />
      </TabsContent>

      <TabsContent value="medias">
        <div className="space-y-6">
          <PackageImagesSection packageId={packageId} />
          <PackageDescriptionAssetsSection packageId={packageId} />
        </div>
      </TabsContent>

      <TabsContent value="publication">
        <PackagePublicationSection
          packageId={packageId}
          initialPackage={pkg}
          onSaved={onPackageUpdated}
        />
      </TabsContent>
    </Tabs>
  );
}
