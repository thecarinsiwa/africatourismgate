import type { Metadata } from 'next';
import { getAdminPageMetadata } from '../../../../lib/i18n/admin-page-i18n';
import { GuidesCalendarPageContent } from '../../../../components/pages/guides-calendar-page-content';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('guides/calendrier');
}

export default function GuidesCalendarPage() {
  return <GuidesCalendarPageContent />;
}
