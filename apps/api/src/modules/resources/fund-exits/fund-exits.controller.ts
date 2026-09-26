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
import { CreateFundExitDto } from './dto/create-fund-exit.dto';
import { FundExitsListQueryDto } from './dto/fund-exits-list-query.dto';
import { UpdateFundExitDto } from './dto/update-fund-exit.dto';
import { FundExitsService } from './fund-exits.service';

@ApiTags('fund-exits')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('fund-exits')
export class FundExitsController {
  constructor(private readonly service: FundExitsService) {}

  @RequirePermissions('treasury.read')
  @Get()
  @ApiOperation({ summary: 'List fund exits (paginated, filtered)' })
  findAll(@Query() query: FundExitsListQueryDto) {
    return this.service.findAll(query);
  }

  @RequirePermissions('treasury.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get fund exit by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOneDto(id);
  }

  @RequirePermissions('treasury.exits.write')
  @Post()
  @ApiOperation({
    summary:
      'Create fund exit (requires expense request with status = authorized)',
  })
  create(
    @Body() dto: CreateFundExitDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('treasury.exits.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update fund exit' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFundExitDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('treasury.exits.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete draft fund exit' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
