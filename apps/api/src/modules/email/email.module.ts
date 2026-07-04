import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationSettings } from '../../entities/generated';
import { BookingDetailPdfService } from './booking-detail-pdf.service';
import { EmailBrandingService } from './email-branding.service';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([OrganizationSettings])],
  controllers: [EmailController],
  providers: [EmailService, EmailBrandingService, BookingDetailPdfService],
  exports: [EmailService, EmailBrandingService, BookingDetailPdfService],
})
export class EmailModule {}
