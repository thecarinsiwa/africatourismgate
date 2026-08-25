import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Activities,
  ActivityItineraryStops,
  ActivityProviders,
  ActivitySchedules,
  Airports,
  BookingGuideAssignments,
  CabinAvailability,
  CruisePorts,
  CruiseSailings,
  FlightClasses,
  Flights,
  ItineraryPorts,
  OrganizationSettings,
  Organizations,
  PackageItems,
  Payments,
  Properties,
  Rooms,
  TourGuides,
  VehicleAvailability,
  Vehicles,
} from '../../entities/generated';
import { BookingDetailPdfEnrichmentService } from './booking-detail-pdf-enrichment.service';
import { BookingDetailPdfService } from './booking-detail-pdf.service';
import { EmailBrandingService } from './email-branding.service';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrganizationSettings,
      Organizations,
      BookingGuideAssignments,
      TourGuides,
      Payments,
      ActivitySchedules,
      Activities,
      ActivityItineraryStops,
      ActivityProviders,
      PackageItems,
      Rooms,
      Properties,
      FlightClasses,
      Flights,
      Airports,
      VehicleAvailability,
      Vehicles,
      CabinAvailability,
      CruiseSailings,
      ItineraryPorts,
      CruisePorts,
    ]),
  ],
  controllers: [EmailController],
  providers: [
    EmailService,
    EmailBrandingService,
    BookingDetailPdfEnrichmentService,
    BookingDetailPdfService,
  ],
  exports: [EmailService, EmailBrandingService, BookingDetailPdfService],
})
export class EmailModule {}
