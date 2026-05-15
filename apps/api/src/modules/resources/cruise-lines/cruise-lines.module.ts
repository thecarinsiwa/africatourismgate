import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CruiseLines } from '../../../entities/generated';
import { CruiseLinesController } from './cruise-lines.controller';
import { CruiseLinesService } from './cruise-lines.service';

@Module({
  imports: [TypeOrmModule.forFeature([CruiseLines])],
  controllers: [CruiseLinesController],
  providers: [CruiseLinesService],
})
export class CruiseLinesModule {}
