import { Controller, Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateGapPageDto } from './dto/create-gap-page.dto';
import { GapPagesListQueryDto } from './dto/gap-pages-list-query.dto';
import { UpdateGapPageDto } from './dto/update-gap-page.dto';
import { GapPagesService } from './gap-pages.service';

@ApiTags('gap-pages')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('gap-pages')
export class GapPagesController {
  constructor(private readonly service: GapPagesService) {}

  @RequirePermissions('gap.read')
  @Get()
  @ApiOperation({ summary: 'List GAP pages' })
  findAll(@Query() query: GapPagesListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('gap.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get GAP page by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('gap.write')
  @Post()
  @ApiOperation({ summary: 'Create GAP page' })
  create(@Body() dto: CreateGapPageDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('gap.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update GAP page' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateGapPageDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('gap.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete GAP page' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
