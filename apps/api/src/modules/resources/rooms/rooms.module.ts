import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rooms } from '../../../entities/generated';
import { RoomsController } from './rooms.controller';
import { RoomsService } from './rooms.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rooms])],
  controllers: [RoomsController],
  providers: [RoomsService],
})
export class RoomsModule {}
