import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotions } from '../../../entities/generated';
import { PromotionsController } from './promotions.controller';
import { PromotionsService } from './promotions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Promotions])],
  controllers: [PromotionsController],
  providers: [PromotionsService],
})
export class PromotionsModule {}
