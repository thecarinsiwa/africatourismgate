import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityProviders, Destinations } from '../../../entities/generated';
import { ActivityProvidersController } from './activity-providers.controller';
import { ActivityProvidersService } from './activity-providers.service';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityProviders, Destinations])],
  controllers: [ActivityProvidersController],
  providers: [ActivityProvidersService],
})
export class ActivityProvidersModule {}
