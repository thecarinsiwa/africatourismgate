import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { AideCategoryPageContent } from '../../../../components/pages/aide-category-page-content';
import {
  getAdminHelpCategoryStaticParams,
  isValidAdminHelpCategorySlug,
  type AdminHelpCategorySlug,
} from '../../../../lib/admin-help/help-catalog';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';

type PageProps = {
  params: { category: string };
};

export function generateStaticParams() {
  return getAdminHelpCategoryStaticParams();
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const base = await getAdminPageMetadata('aide/category');

  if (!isValidAdminHelpCategorySlug(params.category)) {
    return base;
  }

  const t = await getTranslations('modules.adminHelp');
  return {
    ...base,
    title: t(`categories.${params.category}.title`),
    description: t(`categories.${params.category}.description`),
  };
}

export default function AideCategoryPage({ params }: PageProps) {
  if (!isValidAdminHelpCategorySlug(params.category)) {
    notFound();
  }

  return (
    <AideCategoryPageContent
      categorySlug={params.category as AdminHelpCategorySlug}
    />
  );
}
