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
import {
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateLegalPageDto } from './dto/create-legal-page.dto';
import { LegalPagesListQueryDto } from './dto/legal-pages-list-query.dto';
import { UpdateLegalPageDto } from './dto/update-legal-page.dto';
import { LegalPagesService } from './legal-pages.service';

@ApiTags('legal-pages')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('legal-pages')
export class LegalPagesController {
  constructor(private readonly service: LegalPagesService) {}

  @RequirePermissions('content.read')
  @Get()
  @ApiOperation({ summary: 'List legal pages' })
  findAll(@Query() query: LegalPagesListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('content.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get legal page by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('content.write')
  @Post()
  @ApiOperation({ summary: 'Create legal page' })
  create(@Body() dto: CreateLegalPageDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('content.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update legal page' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateLegalPageDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('content.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete legal page' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
