import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LegalPages } from '../../../entities/legal-page.entity';
import { PublicLegalController } from './public-legal.controller';
import { PublicLegalService } from './public-legal.service';

@Module({
  imports: [TypeOrmModule.forFeature([LegalPages])],
  controllers: [PublicLegalController],
  providers: [PublicLegalService],
})
export class PublicLegalModule {}
