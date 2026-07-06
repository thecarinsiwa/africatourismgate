import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiForbiddenResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { teamMemberUploadUrl } from '../../../common/utils/public-asset-url';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { RequirePermissions } from '../../rbac/decorators/require-permissions.decorator';
import { CreateTeamMemberDto } from './dto/create-team-member.dto';
import { TeamMembersListQueryDto } from './dto/team-members-list-query.dto';
import { UpdateTeamMemberDto } from './dto/update-team-member.dto';
import { TeamMembersService } from './team-members.service';

const PHOTO_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_PHOTO_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

@ApiTags('team-members')
@ApiForbiddenResponse({ description: 'Missing permission' })
@Controller('team-members')
export class TeamMembersController {
  constructor(private readonly service: TeamMembersService) {}

  @RequirePermissions('content.read')
  @Get()
  @ApiOperation({ summary: 'List team members' })
  findAll(@Query() query: TeamMembersListQueryDto) {
    return this.service.findAll(query);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const uploadDir = join(process.cwd(), 'uploads', 'about', 'team');
          if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname || '').toLowerCase();
          cb(null, `${Date.now()}-${randomUUID()}${extension}`);
        },
      }),
      limits: { fileSize: PHOTO_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const extension = extname(file.originalname || '').toLowerCase();
        if (
          !ALLOWED_PHOTO_MIMES.has(file.mimetype) ||
          !ALLOWED_PHOTO_EXTENSIONS.has(extension)
        ) {
          cb(null, false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  @RequirePermissions('content.write')
  @Post('upload-photo')
  @ApiOperation({ summary: 'Upload team member photo (JPEG, PNG or WebP, max 5 MB)' })
  uploadPhoto(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): { url: string } {
    if (!file) {
      throw new BadRequestException(
        'Fichier image requis (JPEG, PNG ou WebP, max 5 Mo).',
      );
    }
    return { url: teamMemberUploadUrl(file.filename) };
  }

  @RequirePermissions('content.read')
  @Get(':id')
  @ApiOperation({ summary: 'Get team member by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @RequirePermissions('content.write')
  @Post()
  @ApiOperation({ summary: 'Create team member' })
  create(@Body() dto: CreateTeamMemberDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @RequirePermissions('content.write')
  @Patch(':id')
  @ApiOperation({ summary: 'Update team member' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateTeamMemberDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @RequirePermissions('content.write')
  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete team member' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
