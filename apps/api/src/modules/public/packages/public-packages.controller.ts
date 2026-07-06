import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { PublicPackagesListQueryDto } from './dto/public-packages-list-query.dto';
import { PackageResolveLinesQueryDto } from './dto/package-resolve-lines-query.dto';
import { PublicPackagesService } from './public-packages.service';

@ApiTags('public')
@Controller('public')
export class PublicPackagesController {
  constructor(private readonly service: PublicPackagesService) {}

  @Public()
  @Get('packages')
  @ApiOperation({ summary: 'List active packages with catalog pricing' })
  list(@Query() query: PublicPackagesListQueryDto) {
    return this.service.list(query);
  }

  @Public()
  @Get('packages/featured')
  @ApiOperation({ summary: 'Get homepage featured package' })
  getFeatured() {
    return this.service.getFeatured();
  }

  @Public()
  @Get('packages/:id/resolve-lines')
  @ApiOperation({
    summary: 'Resolve package checkout lines from catalog (ignores availability)',
  })
  resolveLines(
    @Param('id') id: string,
    @Query() query: PackageResolveLinesQueryDto,
  ) {
    return this.service.resolveLines(id, query);
  }

  @Public()
  @Get('packages/:id')
  @ApiOperation({ summary: 'Package detail with included items and discount pricing' })
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }
}
