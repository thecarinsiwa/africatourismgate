import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutPages } from '../../../entities/about-page.entity';
import { AboutPagesController } from './about-pages.controller';
import { AboutPagesService } from './about-pages.service';

@Module({
  imports: [TypeOrmModule.forFeature([AboutPages])],
  controllers: [AboutPagesController],
  providers: [AboutPagesService],
  exports: [AboutPagesService],
})
export class AboutPagesModule {}
