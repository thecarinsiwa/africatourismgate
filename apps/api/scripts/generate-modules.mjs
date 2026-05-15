/**
 * Generates NestJS CRUD modules from generated entities.
 * Run: node apps/api/scripts/generate-modules.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const entitiesIndex = join(__dirname, '../src/entities/generated/index.ts');
const modulesDir = join(__dirname, '../src/modules/resources');

const COMPOSITE_PK = new Set(['RolePermissions', 'PropertyAmenities']);

function tablePath(className) {
  return className
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '')
    .replace(/-/g, '-')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .split('-')
    .map((s, i) => (i === 0 ? s : s))
    .join('-');
}

function toKebab(className) {
  return className
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

const exports = readFileSync(entitiesIndex, 'utf8');
const classNames = [...exports.matchAll(/export \{ (\w+) \}/g)].map((m) => m[1]);

if (!existsSync(modulesDir)) mkdirSync(modulesDir, { recursive: true });

const moduleImports = [];

for (const entity of classNames) {
  const path = toKebab(entity);
  const dir = join(modulesDir, path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  if (COMPOSITE_PK.has(entity)) {
    writeFileSync(
      join(dir, `${path}.service.ts`),
      `import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${entity} } from '../../../entities/generated';
import { PaginationQueryDto, PaginatedResult } from '../../../common/dto/pagination-query.dto';

@Injectable()
export class ${entity}Service {
  constructor(
    @InjectRepository(${entity})
    private readonly repository: Repository<${entity}>,
  ) {}

  async findAll(query: PaginationQueryDto): Promise<PaginatedResult<${entity}>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const [data, total] = await this.repository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async create(dto: Partial<${entity}>): Promise<${entity}> {
    const row = this.repository.create(dto);
    return this.repository.save(row);
  }

  async remove(${entity === 'RolePermissions' ? 'roleId: string, permissionId: string' : 'propertyId: string, amenityId: string'}): Promise<void> {
    const row = await this.repository.findOne({
      where: ${entity === 'RolePermissions' ? '{ roleId, permissionId }' : '{ propertyId, amenityId }'} as never,
    });
    if (!row) throw new NotFoundException('Resource not found');
    await this.repository.softRemove(row);
  }
}
`,
    );
    const pkParams =
      entity === 'RolePermissions'
        ? '@Param("roleId") roleId: string, @Param("permissionId") permissionId: string'
        : '@Param("propertyId") propertyId: string, @Param("amenityId") amenityId: string';
    const pkRoute =
      entity === 'RolePermissions'
        ? ':roleId/:permissionId'
        : ':propertyId/:amenityId';
    const removeCall =
      entity === 'RolePermissions'
        ? 'this.service.remove(roleId, permissionId)'
        : 'this.service.remove(propertyId, amenityId)';

    writeFileSync(
      join(dir, `${path}.controller.ts`),
      `import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ${entity} } from '../../../entities/generated';
import { ${entity}Service } from './${path}.service';

@ApiTags('${path}')
@Controller('${path}')
export class ${entity}Controller {
  constructor(private readonly service: ${entity}Service) {}

  @Get()
  @ApiOperation({ summary: 'List ${path}' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Post()
  @ApiOperation({ summary: 'Create ${path}' })
  create(@Body() dto: Partial<${entity}>) {
    return this.service.create(dto);
  }

  @Delete('${pkRoute}')
  @ApiOperation({ summary: 'Soft-delete ${path}' })
  remove(${pkParams}) {
    return ${removeCall};
  }
}
`,
    );
    writeFileSync(
      join(dir, `${path}.module.ts`),
      `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${entity} } from '../../../entities/generated';
import { ${entity}Controller } from './${path}.controller';
import { ${entity}Service } from './${path}.service';

@Module({
  imports: [TypeOrmModule.forFeature([${entity}])],
  controllers: [${entity}Controller],
  providers: [${entity}Service],
})
export class ${entity}Module {}
`,
    );
  } else {
    writeFileSync(
      join(dir, `${path}.service.ts`),
      `import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ${entity} } from '../../../entities/generated';
import { CrudService } from '../../../common/crud/crud.service';

@Injectable()
export class ${entity}Service extends CrudService<${entity}> {
  constructor(
    @InjectRepository(${entity})
    repository: Repository<${entity}>,
  ) {
    super(repository);
  }
}
`,
    );
    writeFileSync(
      join(dir, `${path}.controller.ts`),
      `import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DeepPartial } from 'typeorm';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { ${entity} } from '../../../entities/generated';
import { ${entity}Service } from './${path}.service';

@ApiTags('${path}')
@Controller('${path}')
export class ${entity}Controller {
  constructor(private readonly service: ${entity}Service) {}

  @Get()
  @ApiOperation({ summary: 'List ${path}' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get ${path} by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create ${path}' })
  create(@Body() dto: DeepPartial<${entity}>) {
    return this.service.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update ${path}' })
  update(@Param('id') id: string, @Body() dto: DeepPartial<${entity}>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete ${path}' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
`,
    );
    writeFileSync(
      join(dir, `${path}.module.ts`),
      `import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${entity} } from '../../../entities/generated';
import { ${entity}Controller } from './${path}.controller';
import { ${entity}Service } from './${path}.service';

@Module({
  imports: [TypeOrmModule.forFeature([${entity}])],
  controllers: [${entity}Controller],
  providers: [${entity}Service],
})
export class ${entity}Module {}
`,
    );
  }

  moduleImports.push(`import { ${entity}Module } from './resources/${path}/${path}.module';`);
}

writeFileSync(
  join(__dirname, '../src/modules/api-resources.module.ts'),
  `${moduleImports.join('\n')}

import { Module } from '@nestjs/common';

@Module({
  imports: [
${classNames.map((e) => `    ${e}Module,`).join('\n')}
  ],
})
export class ApiResourcesModule {}
`,
);

console.log(`Generated ${classNames.length} resource modules`);
