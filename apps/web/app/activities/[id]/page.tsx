import type { Metadata } from 'next';
import { ActivityDetailPageContent } from '../../../components/activities/activity-detail-page-content';
import { getActivityDetail } from '../../../lib/api/public';
import {
  normalizeActivitiesSearchParams,
  parseParticipantsParam,
  toActivityDetailQuery,
} from '../../../lib/activities/listings';

type PageProps = {
  params: { id: string };
  searchParams: Record<string, string | string[] | undefined>;
};

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const normalized = normalizeActivitiesSearchParams(searchParams);

  if (!normalized.date) {
    return {
      title: 'Activité',
      description: 'Fiche activité — Africa Tourism Gate',
    };
  }

  try {
    const detail = await getActivityDetail(params.id, toActivityDetailQuery(normalized));
    return {
      title: detail.title,
      description: detail.description ?? `Activité ${detail.title} avec Africa Tourism Gate.`,
    };
  } catch {
    return {
      title: 'Activité',
      description: 'Fiche activité — Africa Tourism Gate',
    };
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
