import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AboutResources } from '../../../entities/about-resource.entity';
import { AboutResourcesController } from './about-resources.controller';
import { AboutResourcesService } from './about-resources.service';

@Module({
  imports: [TypeOrmModule.forFeature([AboutResources])],
  controllers: [AboutResourcesController],
  providers: [AboutResourcesService],
  exports: [AboutResourcesService],
})
export class AboutResourcesModule {}
