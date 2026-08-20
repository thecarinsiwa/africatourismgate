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
import { DeepPartial } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ActivityImages } from '../../../entities/generated';
import { ActivityImagesService } from './activity-images.service';

@ApiTags('activity-images')
@Controller('activity-images')
export class ActivityImagesController {
  constructor(private readonly service: ActivityImagesService) {}

  @Get()
  @ApiOperation({ summary: 'List activity-images' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get activity-images by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create activity-images' })
  create(@Body() dto: DeepPartial<ActivityImages>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update activity-images' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<ActivityImages>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete activity-images' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
