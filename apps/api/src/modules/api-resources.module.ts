import { UsersModule } from './resources/users/users.module';
import { EmployeesModule } from './resources/employees/employees.module';
import { UserSessionsModule } from './resources/user-sessions/user-sessions.module';
import { PasswordResetTokensModule } from './resources/password-reset-tokens/password-reset-tokens.module';
import { UserAddressesModule } from './resources/user-addresses/user-addresses.module';
import { UserPaymentMethodsModule } from './resources/user-payment-methods/user-payment-methods.module';
import { LoyaltyAccountsModule } from './resources/loyalty-accounts/loyalty-accounts.module';
import { OrganizationsModule } from './resources/organizations/organizations.module';
import { OrganizationSettingsModule } from './resources/organization-settings/organization-settings.module';
import { OrganizationBankAccountsModule } from './resources/organization-bank-accounts/organization-bank-accounts.module';
import { PermissionsModule } from './resources/permissions/permissions.module';
import { RolesModule } from './resources/roles/roles.module';
import { RolePermissionsModule } from './resources/role-permissions/role-permissions.module';
import { UserRoleAssignmentsModule } from './resources/user-role-assignments/user-role-assignments.module';
import { RbacAuditLogsModule } from './resources/rbac-audit-logs/rbac-audit-logs.module';
import { DestinationsModule } from './resources/destinations/destinations.module';
import { PointsOfInterestModule } from './resources/points-of-interest/points-of-interest.module';
import { AmenitiesModule } from './resources/amenities/amenities.module';
import { PropertiesModule } from './resources/properties/properties.module';
import { PropertyImagesModule } from './resources/property-images/property-images.module';
import { PropertyAmenitiesModule } from './resources/property-amenities/property-amenities.module';
import { RoomsModule } from './resources/rooms/rooms.module';
import { RoomAvailabilityModule } from './resources/room-availability/room-availability.module';
import { RoomImagesModule } from './resources/room-images/room-images.module';
import { AirlinesModule } from './resources/airlines/airlines.module';
import { AirportsModule } from './resources/airports/airports.module';
import { FlightsModule } from './resources/flights/flights.module';
import { FlightClassesModule } from './resources/flight-classes/flight-classes.module';
import { FlightClassAvailabilityModule } from './resources/flight-class-availability/flight-class-availability.module';
import { FlightImagesModule } from './resources/flight-images/flight-images.module';
import { RentalAgenciesModule } from './resources/rental-agencies/rental-agencies.module';
import { VehicleCategoriesModule } from './resources/vehicle-categories/vehicle-categories.module';
import { VehiclesModule } from './resources/vehicles/vehicles.module';
import { VehicleAvailabilityModule } from './resources/vehicle-availability/vehicle-availability.module';
import { VehicleImagesModule } from './resources/vehicle-images/vehicle-images.module';
import { ShipImagesModule } from './resources/ship-images/ship-images.module';
import { CruiseLinesModule } from './resources/cruise-lines/cruise-lines.module';
import { CruisePortsModule } from './resources/cruise-ports/cruise-ports.module';
import { ShipsModule } from './resources/ships/ships.module';
import { ItinerariesModule } from './resources/itineraries/itineraries.module';
import { ItineraryPortsModule } from './resources/itinerary-ports/itinerary-ports.module';
import { CabinsModule } from './resources/cabins/cabins.module';
import { CruiseSailingsModule } from './resources/cruise-sailings/cruise-sailings.module';
import { CabinAvailabilityModule } from './resources/cabin-availability/cabin-availability.module';
import { ActivityProvidersModule } from './resources/activity-providers/activity-providers.module';
import { ActivitiesModule } from './resources/activities/activities.module';
import { ActivityImagesModule } from './resources/activity-images/activity-images.module';
import { ActivitySchedulesModule } from './resources/activity-schedules/activity-schedules.module';
import { PackagesModule } from './resources/packages/packages.module';
import { PackageImagesModule } from './resources/package-images/package-images.module';
import { PackageItemsModule } from './resources/package-items/package-items.module';
import { BookingsModule } from './resources/bookings/bookings.module';
import { BookingItemsModule } from './resources/booking-items/booking-items.module';
import { BookingStatusHistoryModule } from './resources/booking-status-history/booking-status-history.module';
import { PaymentsModule } from './resources/payments/payments.module';
import { PromoCodesModule } from './resources/promo-codes/promo-codes.module';
import { PromotionsModule } from './resources/promotions/promotions.module';
import { ReviewsModule } from './resources/reviews/reviews.module';
import { SupportTicketsModule } from './resources/support-tickets/support-tickets.module';
import { SupportMessagesModule } from './resources/support-messages/support-messages.module';
import { TourGuidesModule } from './resources/tour-guides/tour-guides.module';
import { AboutPagesModule } from './resources/about-pages/about-pages.module';
import { AboutResourcesModule } from './resources/about-resources/about-resources.module';
import { BlogPostsModule } from './resources/blog-posts/blog-posts.module';
import { AboutTimelineMilestonesModule } from './resources/about-timeline-milestones/about-timeline-milestones.module';
import { TeamMembersModule } from './resources/team-members/team-members.module';
import { WhyUsItemsModule } from './resources/why-us-items/why-us-items.module';
import { WhyUsSectionsModule } from './resources/why-us-sections/why-us-sections.module';
import { HappyCustomersSectionsModule } from './resources/happy-customers-sections/happy-customers-sections.module';
import { HappyCustomersStatsModule } from './resources/happy-customers-stats/happy-customers-stats.module';
import { HeroSlidesModule } from './resources/hero-slides/hero-slides.module';
import { GapSiteSettingsModule } from './resources/gap-site-settings/gap-site-settings.module';
import { GapPagesModule } from './resources/gap-pages/gap-pages.module';
import { GapActivitiesModule } from './resources/gap-activities/gap-activities.module';
import { GapImpactStatsModule } from './resources/gap-impact-stats/gap-impact-stats.module';
import { GapMediaItemsModule } from './resources/gap-media-items/gap-media-items.module';
import { DonationsModule } from './resources/donations/donations.module';

import { Module } from '@nestjs/common';

@Module({
  imports: [
    UsersModule,
    EmployeesModule,
    UserSessionsModule,
    PasswordResetTokensModule,
    UserAddressesModule,
    UserPaymentMethodsModule,
    LoyaltyAccountsModule,
    OrganizationsModule,
    OrganizationSettingsModule,
    OrganizationBankAccountsModule,
    PermissionsModule,
    RolesModule,
    RolePermissionsModule,
    UserRoleAssignmentsModule,
    RbacAuditLogsModule,
    DestinationsModule,
    PointsOfInterestModule,
    AmenitiesModule,
    PropertiesModule,
    PropertyImagesModule,
    PropertyAmenitiesModule,
    RoomsModule,
    RoomImagesModule,
    RoomAvailabilityModule,
    AirlinesModule,
    AirportsModule,
    FlightsModule,
    FlightClassesModule,
    FlightClassAvailabilityModule,
    FlightImagesModule,
    RentalAgenciesModule,
    VehicleCategoriesModule,
    VehiclesModule,
    VehicleAvailabilityModule,
    VehicleImagesModule,
    CruiseLinesModule,
    CruisePortsModule,
    ShipsModule,
    ShipImagesModule,
    ItinerariesModule,
    ItineraryPortsModule,
    CabinsModule,
    CruiseSailingsModule,
    CabinAvailabilityModule,
    ActivityProvidersModule,
    ActivitiesModule,
    ActivityImagesModule,
    ActivitySchedulesModule,
    PackagesModule,
    PackageImagesModule,
    PackageItemsModule,
    BookingsModule,
    BookingItemsModule,
    BookingStatusHistoryModule,
    PaymentsModule,
    PromoCodesModule,
    PromotionsModule,
    ReviewsModule,
    SupportTicketsModule,
    SupportMessagesModule,
    TourGuidesModule,
    BlogPostsModule,
    AboutPagesModule,
    TeamMembersModule,
    AboutTimelineMilestonesModule,
    AboutResourcesModule,
    WhyUsSectionsModule,
    WhyUsItemsModule,
    HappyCustomersSectionsModule,
    HappyCustomersStatsModule,
    HeroSlidesModule,
    GapSiteSettingsModule,
    GapPagesModule,
    GapActivitiesModule,
    GapImpactStatsModule,
    GapMediaItemsModule,
    DonationsModule,
  ],
})
export class ApiResourcesModule {}
