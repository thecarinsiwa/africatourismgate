import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airlines } from '../../../entities/generated';
import { AirlinesController } from './airlines.controller';
import { AirlinesService } from './airlines.service';

@Module({
  imports: [TypeOrmModule.forFeature([Airlines])],
  controllers: [AirlinesController],
  providers: [AirlinesService],
})
export class AirlinesModule {}
