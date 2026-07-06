import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhyUsSections } from '../../../entities/why-us-section.entity';
import { WhyUsSectionsController } from './why-us-sections.controller';
import { WhyUsSectionsService } from './why-us-sections.service';

@Module({
  imports: [TypeOrmModule.forFeature([WhyUsSections])],
  controllers: [WhyUsSectionsController],
  providers: [WhyUsSectionsService],
  exports: [WhyUsSectionsService],
})
export class WhyUsSectionsModule {}
