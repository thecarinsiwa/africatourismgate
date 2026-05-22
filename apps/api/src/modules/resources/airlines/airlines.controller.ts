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
import { CreateAirlineDto } from './dto/create-airline.dto';
import { AirlinesListQueryDto } from './dto/airlines-list-query.dto';
import { UpdateAirlineDto } from './dto/update-airline.dto';
import { AirlinesService } from './airlines.service';

@ApiTags('airlines')
@Controller('airlines')
export class AirlinesController {
  constructor(private readonly service: AirlinesService) {}

  @Get()
  @ApiOperation({ summary: 'List airlines' })
  findAll(@Query() query: AirlinesListQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get airline by id' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create airline' })
  create(@Body() dto: CreateAirlineDto) {
    return this.service.createAirline(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update airline' })
  update(@Param('id') id: string, @Body() dto: UpdateAirlineDto) {
    return this.service.updateAirline(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete airline' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
