import { Controller, Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateWhyUsItemDto } from './dto/create-why-us-item.dto';
import { UpdateWhyUsItemDto } from './dto/update-why-us-item.dto';
import { WhyUsItemsListQueryDto } from './dto/why-us-items-list-query.dto';
import { WhyUsItemsService } from './why-us-items.service';

@ApiTags('why-us-items')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('why-us-items')
export class WhyUsItemsController {
  constructor(private readonly service: WhyUsItemsService) {}

  @RequirePermissions('content.read')
  @Get()
  @ApiOperation({ summary: 'List why-us items' })
  findAll(@Query() query: WhyUsItemsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('content.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get why-us item by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('content.write')
  @Post()
  @ApiOperation({ summary: 'Create why-us item' })
  create(@Body() dto: CreateWhyUsItemDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('content.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update why-us item' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateWhyUsItemDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('content.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete why-us item' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
