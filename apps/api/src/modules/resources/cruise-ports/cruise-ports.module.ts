import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CruisePorts } from '../../../entities/generated';
import { CruisePortsController } from './cruise-ports.controller';
import { CruisePortsService } from './cruise-ports.service';

@Module({
  imports: [TypeOrmModule.forFeature([CruisePorts])],
  controllers: [CruisePortsController],
  providers: [CruisePortsService],
})
export class CruisePortsModule {}
