import { AnalyticsPageContent } from '../../../components/pages/analytics-page-content';
import { getAdminPageMetadata } from '../../../lib/i18n/admin-page-i18n';

export async function generateMetadata() {
  return getAdminPageMetadata('analytics');
}

export default function AnalyticsPage() {
  return <AnalyticsPageContent />;
}
