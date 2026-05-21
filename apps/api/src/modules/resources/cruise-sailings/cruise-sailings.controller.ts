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
import { CreateCruiseSailingDto } from './dto/create-cruise-sailing.dto';
import { CruiseSailingsListQueryDto } from './dto/cruise-sailings-list-query.dto';
import { UpdateCruiseSailingDto } from './dto/update-cruise-sailing.dto';
import { CruiseSailingsService } from './cruise-sailings.service';

@ApiTags('cruise-sailings')
@Controller('cruise-sailings')
export class CruiseSailingsController {
  constructor(private readonly service: CruiseSailingsService) {}

  @Get()
  @ApiOperation({ summary: 'List cruise sailings' })
  findAll(@Query() query: CruiseSailingsListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cruise sailing by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create cruise sailing' })
  create(@Body() dto: CreateCruiseSailingDto) {
    return this.service.createCruiseSailing(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cruise sailing' })
  update(@Param('id') id: string, @Body() dto: UpdateCruiseSailingDto) {
    return this.service.updateCruiseSailing(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete cruise sailing' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
