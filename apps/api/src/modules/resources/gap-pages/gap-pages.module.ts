import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GapPages } from '../../../entities/gap-page.entity';
import { GapPagesController } from './gap-pages.controller';
import { GapPagesService } from './gap-pages.service';

@Module({
  imports: [TypeOrmModule.forFeature([GapPages])],
  controllers: [GapPagesController],
  providers: [GapPagesService],
  exports: [GapPagesService],
})
export class GapPagesModule {}
