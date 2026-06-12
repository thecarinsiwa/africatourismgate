import type { Metadata } from 'next';
import { PackageDetailPageContent } from '../../../components/packages/package-detail-page-content';
import { getPackageDetail } from '../../../lib/api/public';
import { normalizePackagesSearchParams } from '../../../lib/packages/listings';

type PageProps = {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const detail = await getPackageDetail(params.id);
    return {
      title: detail.package.name,
      description:
        detail.package.description ??
        `Forfait combiné ${detail.package.name} — Africa Tourism Gate.`,
    };
  } catch {
    return {
      title: 'Forfait',
      description: 'Fiche forfait — Africa Tourism Gate',
    };
  }
}

export default function PackageDetailPage({ params, searchParams }: PageProps) {
  const initialSearch = normalizePackagesSearchParams(searchParams);

  return (
    <PackageDetailPageContent packageId={params.id} initialSearch={initialSearch} />
  );
}
