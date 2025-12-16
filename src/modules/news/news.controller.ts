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
  Req,
  NotFoundException,
} from '@nestjs/common';
import { NewsService } from './news.service';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
import { CreateNewsDto, GetAllNewsDto } from '@/types/application';
import { UpdateNewsDto } from '@/types/application';
import { ApplicationInterfaces } from '@/types/application';
import { RequestWithUser, UserRoleEnum } from '@/types/global';

@ApiBearerAuth()
@ApiTags('news')
@Controller('news')
export class NewsController {
  constructor(private readonly applicationService: NewsService) {}

  @Post()
  @ApiBody({ type: CreateNewsDto })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() data: CreateNewsDto): Promise<any> {
    // data.created_by = userId;
    return this.applicationService.create(data);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async getById(
    @Param('id') id: string
  ): Promise<ApplicationInterfaces.ApplicationResponse> {
    return this.applicationService.getById(+id);
  }

  @Get('all')
  @HttpCode(HttpStatus.OK)
  async getAll(@Query() query: GetAllNewsDto): Promise<any> {
    return this.applicationService.getAll(query);
  }

  @Put(':id')
  @ApiBody({ type: UpdateNewsDto })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() data: UpdateNewsDto,
    @Req() req: RequestWithUser
  ): Promise<any> {
    return this.applicationService.update(+id, data, req);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string): Promise<any> {
    return this.applicationService.delete(+id);
  }

  @Patch('restore/:id')
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id') id: string): Promise<any> {
    return this.applicationService.restore(+id);
  }
}
