import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Properties } from '../../../entities/generated';
import { PropertiesController } from './properties.controller';
import { PropertiesService } from './properties.service';

@Module({
  imports: [TypeOrmModule.forFeature([Properties])],
  controllers: [PropertiesController],
  providers: [PropertiesService],
})
export class PropertiesModule {}
