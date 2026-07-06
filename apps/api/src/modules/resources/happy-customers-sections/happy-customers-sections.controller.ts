import { Controller, Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateHappyCustomersSectionDto } from './dto/create-happy-customers-section.dto';
import { HappyCustomersSectionsListQueryDto } from './dto/happy-customers-sections-list-query.dto';
import { UpdateHappyCustomersSectionDto } from './dto/update-happy-customers-section.dto';
import { HappyCustomersSectionsService } from './happy-customers-sections.service';

@ApiTags('happy-customers-sections')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('happy-customers-sections')
export class HappyCustomersSectionsController {
  constructor(private readonly service: HappyCustomersSectionsService) {}

  @RequirePermissions('content.read')
  @Get()
  @ApiOperation({ summary: 'List happy-customers sections' })
  findAll(@Query() query: HappyCustomersSectionsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('content.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get happy-customers section by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('content.write')
  @Post()
  @ApiOperation({ summary: 'Create happy-customers section' })
  create(@Body() dto: CreateHappyCustomersSectionDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('content.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update happy-customers section' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateHappyCustomersSectionDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('content.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete happy-customers section' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
