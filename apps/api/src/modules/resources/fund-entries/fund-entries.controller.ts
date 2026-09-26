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
import { CreateFundEntryDto } from './dto/create-fund-entry.dto';
import { FundEntriesListQueryDto } from './dto/fund-entries-list-query.dto';
import { UpdateFundEntryDto } from './dto/update-fund-entry.dto';
import { FundEntriesService } from './fund-entries.service';

@ApiTags('fund-entries')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('fund-entries')
export class FundEntriesController {
  constructor(private readonly service: FundEntriesService) {}

  @RequirePermissions('treasury.read')
  @Get()
  @ApiOperation({ summary: 'List fund entries (paginated, filtered)' })
  findAll(@Query() query: FundEntriesListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('treasury.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get fund entry by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOneDto(id);
  }

  @RequirePermissions('treasury.entries.write')
  @Post()
  @ApiOperation({ summary: 'Create fund entry' })
  create(
    @Body() dto: CreateFundEntryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('treasury.entries.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update fund entry' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFundEntryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('treasury.entries.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete fund entry' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
