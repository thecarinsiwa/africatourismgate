import { Controller, Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateGapSiteSettingsDto } from './dto/create-gap-site-settings.dto';
import { GapSiteSettingsListQueryDto } from './dto/gap-site-settings-list-query.dto';
import { UpdateGapSiteSettingsDto } from './dto/update-gap-site-settings.dto';
import { GapSiteSettingsService } from './gap-site-settings.service';

@ApiTags('gap-site-settings')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('gap-site-settings')
export class GapSiteSettingsController {
  constructor(private readonly service: GapSiteSettingsService) {}

  @RequirePermissions('gap.read')
  @Get()
  @ApiOperation({ summary: 'List GAP site settings' })
  findAll(@Query() query: GapSiteSettingsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('gap.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get GAP site settings by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('gap.write')
  @Post()
  @ApiOperation({ summary: 'Create GAP site settings' })
  create(@Body() dto: CreateGapSiteSettingsDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('gap.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update GAP site settings' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGapSiteSettingsDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('gap.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete GAP site settings' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
