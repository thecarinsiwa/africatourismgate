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
import { CreatePackageDto } from './dto/create-package.dto';
import { PackagesListQueryDto } from './dto/packages-list-query.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PackagesService } from './packages.service';

@ApiTags('packages')
@Controller('packages')
export class PackagesController {
  constructor(private readonly service: PackagesService) {}

  @Get()
  @ApiOperation({ summary: 'List packages' })
  findAll(@Query() query: PackagesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get package detail with items and pricing' })
  findOne(@Param('id') id: string) {
    return this.service.getPackageDetail(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create package' })
  create(@Body() dto: CreatePackageDto) {
    return this.service.createPackage(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update package' })
  update(@Param('id') id: string, @Body() dto: UpdatePackageDto) {
    return this.service.updatePackage(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete package' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
