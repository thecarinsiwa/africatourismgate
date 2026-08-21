import { CruisesStatCards } from '../cruises/cruises-stat-cards';
import { CruisePortsList } from '../cruises/cruise-ports-list';
import { AdminIntroPage } from './admin-intro-page';

export function PortsCroisierePageContent() {
  return (
    <AdminIntroPage routePath="produits/croisieres/ports">
      <CruisesStatCards className="mb-6" />
      <CruisePortsList />
    </AdminIntroPage>
  );
}
