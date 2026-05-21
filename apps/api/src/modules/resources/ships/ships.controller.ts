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
import { CreateShipDto } from './dto/create-ship.dto';
import { ShipsListQueryDto } from './dto/ships-list-query.dto';
import { UpdateShipDto } from './dto/update-ship.dto';
import { ShipsService } from './ships.service';

@ApiTags('ships')
@Controller('ships')
export class ShipsController {
  constructor(private readonly service: ShipsService) {}

  @Get()
  @ApiOperation({ summary: 'List ships' })
  findAll(@Query() query: ShipsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ship by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create ship' })
  create(@Body() dto: CreateShipDto) {
    return this.service.createShip(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ship' })
  update(@Param('id') id: string, @Body() dto: UpdateShipDto) {
    return this.service.updateShip(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete ship' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
