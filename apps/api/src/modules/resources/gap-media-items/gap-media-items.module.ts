import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GapMediaItems } from '../../../entities/gap-media-item.entity';
import { GapMediaItemsController } from './gap-media-items.controller';
import { GapMediaItemsService } from './gap-media-items.service';

@Module({
  imports: [TypeOrmModule.forFeature([GapMediaItems])],
  controllers: [GapMediaItemsController],
  providers: [GapMediaItemsService],
  exports: [GapMediaItemsService],
})
export class GapMediaItemsModule {}
