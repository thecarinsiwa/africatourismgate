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
import { CreateCruiseLineDto } from './dto/create-cruise-line.dto';
import { CruiseLinesListQueryDto } from './dto/cruise-lines-list-query.dto';
import { UpdateCruiseLineDto } from './dto/update-cruise-line.dto';
import { CruiseLinesService } from './cruise-lines.service';

@ApiTags('cruise-lines')
@Controller('cruise-lines')
export class CruiseLinesController {
  constructor(private readonly service: CruiseLinesService) {}

  @Get()
  @ApiOperation({ summary: 'List cruise lines' })
  findAll(@Query() query: CruiseLinesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cruise line by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create cruise line' })
  create(@Body() dto: CreateCruiseLineDto) {
    return this.service.createCruiseLine(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cruise line' })
  update(@Param('id') id: string, @Body() dto: UpdateCruiseLineDto) {
    return this.service.updateCruiseLine(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete cruise line' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
