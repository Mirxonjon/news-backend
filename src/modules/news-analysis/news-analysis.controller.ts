import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { NewsAnalysisService } from './news-analysis.service';
import {
  CreateNewsAnalysisDto,
  UpdateNewsAnalysisDto,
  QueryNewsAnalysisDto,
} from '@/types/news-analysis';

@ApiBearerAuth()
@ApiTags('news-analysis')
@Controller('news-analysis')
export class NewsAnalysisController {
  constructor(private readonly service: NewsAnalysisService) {}

  @Post()
  @ApiBody({ type: CreateNewsAnalysisDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: CreateNewsAnalysisDto) {
    return this.service.create(data);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(@Param('id') id: string) {
    return this.service.getById(+id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAll(@Query() query: QueryNewsAnalysisDto) {
    return this.service.getAll(query);
  }

  @Put(':id')
  @ApiBody({ type: UpdateNewsAnalysisDto })
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: string, @Body() data: UpdateNewsAnalysisDto) {
    return this.service.update(+id, data);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    return this.service.delete(+id);
  }

  @Patch('restore/:id')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id') id: string) {
    return this.service.restore(+id);
  }
}
