import type { Metadata } from 'next';
import { CarDetailPageContent } from '../../../components/cars/car-detail-page-content';
import { getVehicleDetail } from '../../../lib/api/public';
import {
  normalizeCarsSearchParams,
  toVehicleDetailQuery,
} from '../../../lib/cars/listings';

type PageProps = {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const normalized = normalizeCarsSearchParams(searchParams);
  const apiQuery = toVehicleDetailQuery(normalized);

  if (!apiQuery) {
    return {
      title: 'Véhicule',
      description: 'Fiche véhicule — Africa Tourism Gate',
    };
  }

  try {
    const detail = await getVehicleDetail(params.id, apiQuery);
    const title =
      detail.category.exampleModel ??
      detail.category.name ??
      detail.licensePlate ??
      'Véhicule';
    return {
      title,
      description: `Louez ${title} à ${detail.agency.city || detail.agency.name} avec Africa Tourism Gate.`,
    };
  } catch {
    return {
      title: 'Véhicule',
      description: 'Fiche véhicule — Africa Tourism Gate',
    };
  }
}

export default function CarDetailPage({ params, searchParams }: PageProps) {
  const initialSearch = normalizeCarsSearchParams(searchParams);

  return (
    <CarDetailPageContent vehicleId={params.id} initialSearch={initialSearch} />
  );
}
