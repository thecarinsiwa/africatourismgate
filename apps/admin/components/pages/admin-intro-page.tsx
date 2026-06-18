'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { AdminPageIntro, type AdminIntroLink } from '../admin-page-intro';
import { routePathToTranslationNamespace } from '../../lib/i18n/admin-page-i18n';

type IntroLinkDef = {
  href: string;
  labelKey: string;
};

type AdminIntroPageProps = {
  routePath: string;
  children: ReactNode;
  links?: IntroLinkDef[];
  backHref?: string;
  backLabelKey?: string;
  introChildren?: ReactNode;
};

export function AdminIntroPage({
  routePath,
  children,
  links,
  backHref,
  backLabelKey,
  introChildren,
}: AdminIntroPageProps) {
  const t = useTranslations(routePathToTranslationNamespace(routePath));

  const resolvedLinks: AdminIntroLink[] | undefined = links?.map((link) => ({
    href: link.href,
    label: t(link.labelKey),
  }));

  const description = t.has?.('description') ? t('description') : undefined;
  const backLabel = backLabelKey && t.has?.(backLabelKey) ? t(backLabelKey) : undefined;

  return (
    <div>
      {introChildren ? (
        <AdminPageIntro backHref={backHref} backLabel={backLabel}>
          {introChildren}
        </AdminPageIntro>
      ) : (
        <AdminPageIntro
          description={description}
          links={resolvedLinks}
          backHref={backHref}
          backLabel={backLabel}
        />
      )}
      {children}
    </div>
  );
}
