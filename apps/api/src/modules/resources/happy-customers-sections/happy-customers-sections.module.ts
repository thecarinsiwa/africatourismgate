import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HappyCustomersSections } from '../../../entities/happy-customers-section.entity';
import { HappyCustomersSectionsController } from './happy-customers-sections.controller';
import { HappyCustomersSectionsService } from './happy-customers-sections.service';

@Module({
  imports: [TypeOrmModule.forFeature([HappyCustomersSections])],
  controllers: [HappyCustomersSectionsController],
  providers: [HappyCustomersSectionsService],
  exports: [HappyCustomersSectionsService],
})
export class HappyCustomersSectionsModule {}
