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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthUserDto } from '../../auth/dto/auth-user.dto';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { EmployeesListQueryDto } from './dto/employees-list-query.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { EmployeesService } from './employees.service';

@ApiTags('employees')
@Controller('employees')
export class EmployeesController {
  constructor(private readonly service: EmployeesService) {}

  @Get()
  @ApiOperation({ summary: 'List employees' })
  findAll(
    @Query() query: EmployeesListQueryDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.list(query, user);
  }

  @Get('departments')
  @ApiOperation({ summary: 'List distinct employee departments' })
  listDepartments() {
    return this.service.listDepartments();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get employees by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOneDto(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create employees' })
  create(@Body() dto: CreateEmployeeDto, @CurrentUser() user: AuthUserDto) {
    return this.service.createFromDto(dto, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update employees' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateEmployeeDto,
    @CurrentUser() user: AuthUserDto,
  ) {
    return this.service.updateFromDto(id, dto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete employees' })
  remove(@Param('id') id: string, @CurrentUser() user: AuthUserDto) {
    return this.service.remove(id, user.id);
  }
}
