import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalPages } from '../../../entities/legal-page.entity';
import { LegalPagesController } from './legal-pages.controller';
import { LegalPagesService } from './legal-pages.service';

@Module({
  imports: [TypeOrmModule.forFeature([LegalPages])],
  controllers: [LegalPagesController],
  providers: [LegalPagesService],
  exports: [LegalPagesService],
})
export class LegalPagesModule {}
