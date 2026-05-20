import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomsListQueryDto } from './dto/rooms-list-query.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { RoomsService } from './rooms.service';

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
  constructor(private readonly service: RoomsService) {}

  @Get()
  @ApiOperation({ summary: 'List rooms' })
  findAll(@Query() query: RoomsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get room by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create room' })
  create(@Body() dto: CreateRoomDto) {
    return this.service.createRoom(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update room' })
  update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.service.updateRoom(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete room' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
