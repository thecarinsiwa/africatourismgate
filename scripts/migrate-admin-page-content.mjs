import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const appDir = join(root, 'apps', 'admin', 'app', '(dashboard)');
const contentDir = join(root, 'apps', 'admin', 'components', 'pages');

mkdirSync(contentDir, { recursive: true });

/** @type {Array<{ route: string; exportName: string; body: string }>} */
const specs = [
  {
    route: 'utilisateurs',
    exportName: 'UtilisateursPageContent',
    body: `import { UsersList } from '../users/users-list';
import { UsersStatCards } from '../users/users-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function UtilisateursPageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs">
      <UsersStatCards className="mb-6" />
      <UsersList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'utilisateurs/nouveau',
    exportName: 'NouveauUtilisateurPageContent',
    body: `import { UserForm } from '../users/user-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauUtilisateurPageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs/nouveau">
      <UserForm />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'utilisateurs/employes',
    exportName: 'EmployesPageContent',
    body: `import { EmployeesList } from '../employees/employees-list';
import { AdminIntroPage } from './admin-intro-page';

export function EmployesPageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs/employes">
      <EmployeesList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'utilisateurs/employes/nouveau',
    exportName: 'NouveauEmployePageContent',
    body: `import { EmployeeForm } from '../employees/employee-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauEmployePageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs/employes/nouveau">
      <EmployeeForm />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'utilisateurs/adresses',
    exportName: 'AdressesPageContent',
    body: `import { UserAddressesList } from '../users/user-addresses-list';
import { AdminIntroPage } from './admin-intro-page';

export function AdressesPageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs/adresses">
      <UserAddressesList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'utilisateurs/moyens-paiement',
    exportName: 'MoyensPaiementPageContent',
    body: `import { UserPaymentMethodsList } from '../users/user-payment-methods-list';
import { AdminIntroPage } from './admin-intro-page';

export function MoyensPaiementPageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs/moyens-paiement">
      <UserPaymentMethodsList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'utilisateurs/sessions',
    exportName: 'SessionsPageContent',
    body: `import { UserSessionsList } from '../users/user-sessions-list';
import { AdminIntroPage } from './admin-intro-page';

export function SessionsPageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs/sessions">
      <UserSessionsList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'utilisateurs/journaux-securite',
    exportName: 'JournauxSecuritePageContent',
    body: `import { RbacAuditLogsList } from '../rbac/rbac-audit-logs-list';
import { AdminIntroPage } from './admin-intro-page';

export function JournauxSecuritePageContent() {
  return (
    <AdminIntroPage routePath="utilisateurs/journaux-securite">
      <RbacAuditLogsList showSubnav={false} />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'hebergements',
    exportName: 'HebergementsPageContent',
    body: `import { PropertiesList } from '../properties/properties-list';
import { PropertiesStatCards } from '../properties/properties-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function HebergementsPageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="hebergements" />
      <PropertiesStatCards className="mb-6" />
      <PropertiesList />
    </div>
  );
}`,
  },
  {
    route: 'hebergements/nouveau',
    exportName: 'NouvelHebergementPageContent',
    body: `import { PropertyForm } from '../properties/property-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouvelHebergementPageContent() {
  return (
    <AdminIntroPage routePath="hebergements/nouveau">
      <PropertyForm />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'hebergements/equipements',
    exportName: 'EquipementsPageContent',
    body: `import { AmenitiesList } from '../amenities/amenities-list';
import { AdminIntroPage } from './admin-intro-page';

export function EquipementsPageContent() {
  return (
    <AdminIntroPage routePath="hebergements/equipements">
      <AmenitiesList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'organisations',
    exportName: 'OrganisationsPageContent',
    body: `import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { OrganizationsList } from '../organizations/organizations-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function OrganisationsPageContent() {
  const tNav = useTranslations('nav.links');
  return (
    <div>
      <AdminListPageHeader
        routePath="organisations"
        actions={
          <Button href="/organisations/nouveau" variant="primary">
            {tNav('newOrganization')}
          </Button>
        }
      />
      <OrganizationsList />
    </div>
  );
}`,
  },
  {
    route: 'organisations/nouveau',
    exportName: 'NouvelleOrganisationPageContent',
    body: `import { OrganizationForm } from '../organizations/organization-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouvelleOrganisationPageContent() {
  return (
    <AdminIntroPage routePath="organisations/nouveau">
      <OrganizationForm />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'fidelite/comptes',
    exportName: 'ComptesFidelitePageContent',
    body: `import { LoyaltyAccountsList } from '../loyalty/loyalty-accounts-list';
import { LoyaltySummaryCards } from '../loyalty/loyalty-summary-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function ComptesFidelitePageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="fidelite/comptes" />
      <LoyaltySummaryCards className="mb-6" />
      <LoyaltyAccountsList />
    </div>
  );
}`,
  },
  {
    route: 'produits/activites',
    exportName: 'ActivitesPageContent',
    body: `import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { ActivitiesList } from '../activities/activities-list';
import { ActivitiesStatCards } from '../activities/activities-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function ActivitesPageContent() {
  const t = useTranslations('pages.produits.activites');
  return (
    <div>
      <AdminListPageHeader
        routePath="produits/activites"
        actions={
          <>
            <Button href="/produits/activites/fournisseurs" variant="outline">
              {t('actions.providers')}
            </Button>
            <Button href="/produits/activites/nouveau">{t('actions.new')}</Button>
          </>
        }
      />
      <ActivitiesStatCards className="mb-6" />
      <ActivitiesList />
    </div>
  );
}`,
  },
  {
    route: 'produits/activites/nouveau',
    exportName: 'NouvelleActivitePageContent',
    body: `import { ActivityForm } from '../activities/activity-form';
import { AdminListPageHeader } from './admin-list-page-header';

export function NouvelleActivitePageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="produits/activites/nouveau" titleKey="metaTitle" />
      <ActivityForm />
    </div>
  );
}`,
  },
  {
    route: 'produits/activites/fournisseurs',
    exportName: 'FournisseursActivitesPageContent',
    body: `import { ActivityProvidersList } from '../activities/activity-providers-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function FournisseursActivitesPageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="produits/activites/fournisseurs" />
      <ActivityProvidersList />
    </div>
  );
}`,
  },
  {
    route: 'produits/destinations',
    exportName: 'DestinationsPageContent',
    body: `import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { DestinationsList } from '../destinations/destinations-list';
import { DestinationsStatCards } from '../destinations/destinations-stat-cards';
import { AdminListPageHeader } from './admin-list-page-header';

export function DestinationsPageContent() {
  const t = useTranslations('pages.produits.destinations');
  return (
    <div>
      <AdminListPageHeader
        routePath="produits/destinations"
        actions={
          <Button href="/produits/destinations/nouveau" variant="primary">
            {t('actions.new')}
          </Button>
        }
      />
      <DestinationsStatCards className="mb-6" />
      <DestinationsList />
    </div>
  );
}`,
  },
  {
    route: 'produits/destinations/nouveau',
    exportName: 'NouvelleDestinationPageContent',
    body: `import { DestinationForm } from '../destinations/destination-form';
import { AdminListPageHeader } from './admin-list-page-header';

export function NouvelleDestinationPageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="produits/destinations/nouveau" titleKey="metaTitle" />
      <DestinationForm />
    </div>
  );
}`,
  },
  {
    route: 'produits/locations',
    exportName: 'LocationsPageContent',
    body: `import { TextLink } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { LocationsStatCards } from '../locations/locations-stat-cards';
import { VehiclesList } from '../locations/vehicles-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function LocationsPageContent() {
  const t = useTranslations('pages.produits.locations');
  return (
    <div>
      <AdminListPageHeader routePath="produits/locations" />
      <p className="-mt-4 mb-6 text-sm text-atg-muted">
        <TextLink href="/produits/locations/agences" variant="primary" className="font-medium">
          {t('links.agencies')}
        </TextLink>
        <span className="mx-2">·</span>
        <TextLink href="/produits/locations/categories" variant="primary" className="font-medium">
          {t('links.categories')}
        </TextLink>
      </p>
      <LocationsStatCards className="mb-6" />
      <VehiclesList />
    </div>
  );
}`,
  },
  {
    route: 'produits/locations/agences',
    exportName: 'AgencesLocationPageContent',
    body: `import { RentalAgenciesList } from '../locations/rental-agencies-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function AgencesLocationPageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="produits/locations/agences" />
      <RentalAgenciesList />
    </div>
  );
}`,
  },
  {
    route: 'produits/locations/categories',
    exportName: 'CategoriesVehiculesPageContent',
    body: `import { VehicleCategoriesList } from '../locations/vehicle-categories-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function CategoriesVehiculesPageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="produits/locations/categories" />
      <VehicleCategoriesList />
    </div>
  );
}`,
  },
  {
    route: 'produits/locations/nouveau',
    exportName: 'NouveauVehiculePageContent',
    body: `import { VehicleForm } from '../locations/vehicle-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauVehiculePageContent() {
  return (
    <AdminIntroPage routePath="produits/locations/nouveau" backHref="/produits/locations" backLabelKey="backLabel">
      <VehicleForm mode="create" />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'produits/vols',
    exportName: 'VolsPageContent',
    body: `import { FlightsList } from '../flights/flights-list';
import { FlightsStatCards } from '../flights/flights-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function VolsPageContent() {
  return (
    <AdminIntroPage
      routePath="produits/vols"
      links={[
        { href: '/produits/vols/compagnies', labelKey: 'links.airlines' },
        { href: '/produits/vols/aeroports', labelKey: 'links.airports' },
      ]}
    >
      <FlightsStatCards className="mb-6" />
      <FlightsList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'produits/vols/nouveau',
    exportName: 'NouveauVolPageContent',
    body: `import { FlightForm } from '../flights/flight-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauVolPageContent() {
  return (
    <AdminIntroPage routePath="produits/vols/nouveau" backHref="/produits/vols" backLabelKey="backLabel">
      <FlightForm mode="create" />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'produits/vols/compagnies',
    exportName: 'CompagniesPageContent',
    body: `import { AirlinesList } from '../flights/airlines-list';
import { AdminIntroPage } from './admin-intro-page';

export function CompagniesPageContent() {
  return (
    <AdminIntroPage routePath="produits/vols/compagnies" backHref="/produits/vols" backLabelKey="backLabel">
      <AirlinesList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'produits/vols/aeroports',
    exportName: 'AeroportsPageContent',
    body: `import { AirportsList } from '../flights/airports-list';
import { AdminIntroPage } from './admin-intro-page';

export function AeroportsPageContent() {
  return (
    <AdminIntroPage routePath="produits/vols/aeroports" backHref="/produits/vols" backLabelKey="backLabel">
      <AirportsList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'produits/croisieres',
    exportName: 'CroisieresPageContent',
    body: `import { CruisesStatCards } from '../cruises/cruises-stat-cards';
import { SailingsList } from '../cruises/sailings-list';
import { AdminIntroPage } from './admin-intro-page';

export function CroisieresPageContent() {
  return (
    <AdminIntroPage
      routePath="produits/croisieres"
      links={[
        { href: '/produits/croisieres/lignes', labelKey: 'links.lines' },
        { href: '/produits/croisieres/ports', labelKey: 'links.ports' },
        { href: '/produits/croisieres/navires', labelKey: 'links.ships' },
      ]}
    >
      <CruisesStatCards className="mb-6" />
      <SailingsList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'produits/croisieres/nouveau',
    exportName: 'NouveauDepartPageContent',
    body: `import { SailingForm } from '../cruises/sailing-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauDepartPageContent() {
  return (
    <AdminIntroPage routePath="produits/croisieres/nouveau">
      <SailingForm mode="create" />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'produits/croisieres/lignes',
    exportName: 'LignesCroisierePageContent',
    body: `import { CruiseLinesList } from '../cruises/cruise-lines-list';
import { AdminIntroPage } from './admin-intro-page';

export function LignesCroisierePageContent() {
  return (
    <AdminIntroPage routePath="produits/croisieres/lignes">
      <CruiseLinesList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'produits/croisieres/ports',
    exportName: 'PortsCroisierePageContent',
    body: `import { CruisePortsList } from '../cruises/cruise-ports-list';
import { AdminIntroPage } from './admin-intro-page';

export function PortsCroisierePageContent() {
  return (
    <AdminIntroPage routePath="produits/croisieres/ports">
      <CruisePortsList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'produits/croisieres/navires',
    exportName: 'NaviresPageContent',
    body: `import { CruisesStatCards } from '../cruises/cruises-stat-cards';
import { ShipsList } from '../cruises/ships-list';
import { AdminIntroPage } from './admin-intro-page';

export function NaviresPageContent() {
  return (
    <AdminIntroPage
      routePath="produits/croisieres/navires"
      links={[{ href: '/produits/croisieres', labelKey: 'links.backToSailings' }]}
    >
      <CruisesStatCards className="mb-6" />
      <ShipsList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'produits/croisieres/navires/nouveau',
    exportName: 'NouveauNavirePageContent',
    body: `import { ShipForm } from '../cruises/ship-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauNavirePageContent() {
  return (
    <AdminIntroPage routePath="produits/croisieres/navires/nouveau">
      <ShipForm mode="create" />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'produits/forfaits',
    exportName: 'ForfaitsPageContent',
    body: `import { PackagesList } from '../packages/packages-list';
import { PackagesStatCards } from '../packages/packages-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function ForfaitsPageContent() {
  return (
    <AdminIntroPage routePath="produits/forfaits">
      <PackagesStatCards className="mb-6" />
      <PackagesList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'produits/forfaits/nouveau',
    exportName: 'NouveauForfaitPageContent',
    body: `import { PackageForm } from '../packages/package-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauForfaitPageContent() {
  return (
    <AdminIntroPage routePath="produits/forfaits/nouveau">
      <PackageForm mode="create" />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'reservations',
    exportName: 'ReservationsPageContent',
    body: `import { BookingsList } from '../bookings/bookings-list';
import { BookingsStatCards } from '../bookings/bookings-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function ReservationsPageContent() {
  return (
    <AdminIntroPage routePath="reservations">
      <BookingsStatCards className="mb-6" />
      <BookingsList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'reservations/lignes',
    exportName: 'LignesReservationPageContent',
    body: `import { BookingItemsList } from '../bookings/booking-items-list';
import { BookingItemsStatCards } from '../bookings/booking-items-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function LignesReservationPageContent() {
  return (
    <AdminIntroPage routePath="reservations/lignes">
      <BookingItemsStatCards className="mb-6" />
      <BookingItemsList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'paiements',
    exportName: 'PaiementsPageContent',
    body: `import { PaymentsList } from '../payments/payments-list';
import { PaymentsStatCards } from '../payments/payments-stat-cards';
import { AdminIntroPage } from './admin-intro-page';

export function PaiementsPageContent() {
  return (
    <AdminIntroPage routePath="paiements">
      <PaymentsStatCards className="mb-6" />
      <PaymentsList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'paiements/codes-promo',
    exportName: 'CodesPromoPageContent',
    body: `import { TextLink } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { PromoCodesList } from '../promo-codes/promo-codes-list';
import { AdminPageIntro } from '../admin-page-intro';

export function CodesPromoPageContent() {
  const t = useTranslations('pages.paiements.codes-promo');
  return (
    <div>
      <PaymentsPromoSubnav />
      <AdminPageIntro>
        <p>
          {t('intro')}{' '}
          <TextLink href="/paiements/promotions" variant="primary" className="font-medium">
            {t('linkPromotions')}
          </TextLink>
          .
        </p>
      </AdminPageIntro>
      <PromoCodesList />
    </div>
  );
}`,
  },
  {
    route: 'paiements/codes-promo/nouveau',
    exportName: 'NouveauCodePromoPageContent',
    body: `import { PromoCodeForm } from '../promo-codes/promo-code-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouveauCodePromoPageContent() {
  return (
    <AdminIntroPage routePath="paiements/codes-promo/nouveau">
      <PromoCodeForm mode="create" />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'paiements/promotions',
    exportName: 'PromotionsPageContent',
    body: `import { TextLink } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { PaymentsPromoSubnav } from '../payments/payments-promo-subnav';
import { PromotionsList } from '../promotions/promotions-list';
import { AdminPageIntro } from '../admin-page-intro';

export function PromotionsPageContent() {
  const t = useTranslations('pages.paiements.promotions');
  return (
    <div>
      <PaymentsPromoSubnav />
      <AdminPageIntro>
        <p>
          {t('intro')}{' '}
          <TextLink href="/paiements/codes-promo" variant="primary" className="font-medium">
            {t('linkPromoCodes')}
          </TextLink>
          .
        </p>
      </AdminPageIntro>
      <PromotionsList />
    </div>
  );
}`,
  },
  {
    route: 'paiements/promotions/nouveau',
    exportName: 'NouvellePromotionPageContent',
    body: `import { PromotionForm } from '../promotions/promotion-form';
import { AdminIntroPage } from './admin-intro-page';

export function NouvellePromotionPageContent() {
  return (
    <AdminIntroPage routePath="paiements/promotions/nouveau">
      <PromotionForm mode="create" />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'contenu/tickets',
    exportName: 'TicketsPageContent',
    body: `import { SupportTicketsList } from '../support/support-tickets-list';
import { AdminIntroPage } from './admin-intro-page';

export function TicketsPageContent() {
  return (
    <AdminIntroPage routePath="contenu/tickets">
      <SupportTicketsList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'contenu/avis',
    exportName: 'AvisPageContent',
    body: `import { ReviewsList } from '../reviews/reviews-list';
import { AdminIntroPage } from './admin-intro-page';

export function AvisPageContent() {
  return (
    <AdminIntroPage routePath="contenu/avis">
      <ReviewsList />
    </AdminIntroPage>
  );
}`,
  },
  {
    route: 'systeme/roles',
    exportName: 'RolesPageContent',
    body: `import { Button } from '@africatourismgate/ui';
import { useTranslations } from 'next-intl';
import { RolesList } from '../rbac/roles-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function RolesPageContent() {
  const t = useTranslations('pages.systeme.roles');
  return (
    <div>
      <AdminListPageHeader
        routePath="systeme/roles"
        actions={<Button href="/systeme/roles/nouveau">{t('actions.new')}</Button>}
      />
      <RolesList />
    </div>
  );
}`,
  },
  {
    route: 'systeme/roles/nouveau',
    exportName: 'NouveauRolePageContent',
    body: `import { RoleForm } from '../rbac/role-form';
import { AdminListPageHeader } from './admin-list-page-header';

export function NouveauRolePageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="systeme/roles/nouveau" titleKey="metaTitle" />
      <RoleForm mode="create" />
    </div>
  );
}`,
  },
  {
    route: 'systeme/roles/permissions',
    exportName: 'PermissionsPageContent',
    body: `import { PermissionsList } from '../rbac/permissions-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function PermissionsPageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="systeme/roles/permissions" />
      <PermissionsList />
    </div>
  );
}`,
  },
  {
    route: 'systeme/roles/assignations',
    exportName: 'AssignationsPageContent',
    body: `import { UserRoleAssignmentsList } from '../rbac/user-role-assignments-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function AssignationsPageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="systeme/roles/assignations" />
      <UserRoleAssignmentsList />
    </div>
  );
}`,
  },
  {
    route: 'systeme/audit',
    exportName: 'AuditPageContent',
    body: `import { RbacAuditLogsList } from '../rbac/rbac-audit-logs-list';
import { AdminListPageHeader } from './admin-list-page-header';

export function AuditPageContent() {
  return (
    <div>
      <AdminListPageHeader routePath="systeme/audit" />
      <RbacAuditLogsList />
    </div>
  );
}`,
  },
];

function slugify(route) {
  return route.replace(/\//g, '-');
}

function pagePath(route) {
  return join(appDir, ...route.split('/'), 'page.tsx');
}

function i18nImport(pagePathFile) {
  const rel = relative(dirname(pagePathFile), join(root, 'apps', 'admin', 'lib', 'i18n', 'admin-page-i18n'));
  return rel.replace(/\\/g, '/');
}

function contentImport(pagePathFile, slug) {
  const rel = relative(dirname(pagePathFile), contentDir).replace(/\\/g, '/');
  return `${rel}/${slug}-page-content`;
}

for (const spec of specs) {
  const slug = slugify(spec.route);
  const contentFile = join(contentDir, `${slug}-page-content.tsx`);
  writeFileSync(contentFile, `'use client';\n\n${spec.body}\n`, 'utf8');

  const targetPage = pagePath(spec.route);
  const i18nPath = i18nImport(targetPage);
  const contentPath = contentImport(targetPage, slug);

  const pageSource = `import type { Metadata } from 'next';
import { getAdminPageMetadata } from '${i18nPath}';
import { ${spec.exportName} } from '${contentPath}';

export async function generateMetadata(): Promise<Metadata> {
  return getAdminPageMetadata('${spec.route}');
}

export default function Page() {
  return <${spec.exportName} />;
}
`;

  writeFileSync(targetPage, pageSource, 'utf8');
  console.log('Migrated', spec.route);
}

