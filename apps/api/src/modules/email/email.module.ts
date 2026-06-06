import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizationSettings } from '../../entities/generated';
import { EmailBrandingService } from './email-branding.service';
import { EmailService } from './email.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([OrganizationSettings])],
  providers: [EmailService, EmailBrandingService],
  exports: [EmailService, EmailBrandingService],
})
export class EmailModule {}
