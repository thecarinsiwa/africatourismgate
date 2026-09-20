import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { ActivityDetailPageContent } from '../../../components/activities/activity-detail-page-content';
import { getActivityDetail } from '../../../lib/api/public';
import {
  normalizeActivitiesSearchParams,
  parseParticipantsParam,
  toActivityDetailQuery,
} from '../../../lib/activities/listings';
import {
  buildDetailFallbackMetadata,
  buildPageMetadata,
  pickOgImages,
  truncateMetaDescription,
} from '../../../lib/seo/metadata';

type PageProps = {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const path = `/activities/${params.id}`;
  const normalized = normalizeActivitiesSearchParams(searchParams);

  if (!normalized.date) {
    return buildDetailFallbackMetadata('activities', path);
  }

  try {
    const [detail, t, locale] = await Promise.all([
      getActivityDetail(params.id, toActivityDetailQuery(normalized)),
      getTranslations('activities'),
      getLocale(),
    ]);
    const description = detail.description
      ? truncateMetaDescription(detail.description)
      : t('detailMetaDescription', { name: detail.title });
    return buildPageMetadata({
      title: detail.title,
      description,
      path,
      locale,
      images: pickOgImages(detail.images),
      twitterCard: 'summary_large_image',
    });
  } catch {
    return buildDetailFallbackMetadata('activities', path);
  }
}

export default function ActivityDetailPage({ params, searchParams }: PageProps) {
  const initialSearch = normalizeActivitiesSearchParams(searchParams);
  const participants = parseParticipantsParam(initialSearch.participants);

  return (
    <ActivityDetailPageContent
      activityId={params.id}
      initialSearch={{
        ...initialSearch,
        participants: String(participants),
        scheduleId:
          typeof searchParams.scheduleId === 'string' ? searchParams.scheduleId : undefined,
      }}
    />
  );
}
