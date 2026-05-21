import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CruiseSailings, Itineraries } from '../../../entities/generated';
import { CruiseSailingsController } from './cruise-sailings.controller';
import { CruiseSailingsService } from './cruise-sailings.service';

@Module({
  imports: [TypeOrmModule.forFeature([CruiseSailings, Itineraries])],
  controllers: [CruiseSailingsController],
  providers: [CruiseSailingsService],
})
export class CruiseSailingsModule {}
