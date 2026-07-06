import { Controller, Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateWhyUsSectionDto } from './dto/create-why-us-section.dto';
import { UpdateWhyUsSectionDto } from './dto/update-why-us-section.dto';
import { WhyUsSectionsListQueryDto } from './dto/why-us-sections-list-query.dto';
import { WhyUsSectionsService } from './why-us-sections.service';

@ApiTags('why-us-sections')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('why-us-sections')
export class WhyUsSectionsController {
  constructor(private readonly service: WhyUsSectionsService) {}

  @RequirePermissions('content.read')
  @Get()
  @ApiOperation({ summary: 'List why-us sections' })
  findAll(@Query() query: WhyUsSectionsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('content.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get why-us section by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('content.write')
  @Post()
  @ApiOperation({ summary: 'Create why-us section' })
  create(@Body() dto: CreateWhyUsSectionDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('content.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update why-us section' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWhyUsSectionDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('content.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete why-us section' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
