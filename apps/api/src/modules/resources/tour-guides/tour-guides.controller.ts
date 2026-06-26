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
import { ApiForbiddenResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateTourGuideDto } from './dto/create-tour-guide.dto';
import { TourGuidesListQueryDto } from './dto/tour-guides-list-query.dto';
import { UpdateTourGuideDto } from './dto/update-tour-guide.dto';
import { TourGuidesService } from './tour-guides.service';

@ApiTags('tour-guides')
@ApiForbiddenResponse({ description: 'Permission manquante' })
@Controller('tour-guides')
export class TourGuidesController {
  constructor(private readonly service: TourGuidesService) {}

  @Get()
  @RequirePermissions('guides.read')
  @ApiOperation({ summary: 'Liste paginée des guides touristiques' })
  findAll(@Query() query: TourGuidesListQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  @RequirePermissions('guides.read')
  @ApiOperation({ summary: 'Détail d’un guide touristique' })
  findOne(@Param('id') id: string) {
    return this.service.findOneDto(id);
  }

  @Post()
  @RequirePermissions('guides.write')
  @ApiOperation({ summary: 'Créer un guide touristique' })
  create(@Body() dto: CreateTourGuideDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @Patch(':id')
  @RequirePermissions('guides.write')
  @ApiOperation({ summary: 'Mettre à jour un guide touristique' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTourGuideDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @Delete(':id')
  @RequirePermissions('guides.write')
  @ApiOperation({ summary: 'Suppression logique d’un guide touristique' })
  async remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    await this.service.removeDto(id, user.id);
  }
}
