import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhyUsItems } from '../../../entities/why-us-item.entity';
import { WhyUsItemsController } from './why-us-items.controller';
import { WhyUsItemsService } from './why-us-items.service';

@Module({
  imports: [TypeOrmModule.forFeature([WhyUsItems])],
  controllers: [WhyUsItemsController],
  providers: [WhyUsItemsService],
  exports: [WhyUsItemsService],
})
export class WhyUsItemsModule {}
