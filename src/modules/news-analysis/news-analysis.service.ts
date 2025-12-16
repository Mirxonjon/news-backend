import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { Prisma, NewsAnalysis } from '@prisma/client';
import { CreateNewsAnalysisDto } from '@/types/news-analysis';
import { UpdateNewsAnalysisDto } from '@/types/news-analysis';
import { QueryNewsAnalysisDto } from '@/types/news-analysis';
import { DefaultStatusEnum } from '@/types/global';

@Injectable()
export class NewsAnalysisService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateNewsAnalysisDto): Promise<NewsAnalysis> {
    return this.prisma.newsAnalysis.create({ data });
  }

  async getById(id: number): Promise<NewsAnalysis> {
    const item = await this.prisma.newsAnalysis.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NewsAnalysis not found');
    return item;
  }

  async getAll(query: QueryNewsAnalysisDto): Promise<{
    items: NewsAnalysis[];
    total: number;
    page?: number;
    limit?: number;
  }> {
    const {
      page = 1,
      limit = 10,
      all = false,
      status = DefaultStatusEnum.Active,
      ticker,
      sentiment,
      newsId,
      dateFrom,
      dateTo,
    } = query;

    const where: Prisma.NewsAnalysisWhereInput = {
      ...(status !== undefined ? { status } : {}),
      ...(ticker ? { ticker: { equals: ticker } } : {}),
      ...(sentiment ? { sentiment: { equals: sentiment } } : {}),
      ...(newsId ? { newsId: Number(newsId) } : {}),
      ...(dateFrom || dateTo
        ? {
            createdAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            },
          }
        : {}),
    };

    const orderBy: Prisma.NewsAnalysisOrderByWithRelationInput = {
      createdAt: 'desc',
    };

    if (all) {
      const [items, total] = await Promise.all([
        this.prisma.newsAnalysis.findMany({ where, orderBy }),
        this.prisma.newsAnalysis.count({ where }),
      ]);
      return { items, total };
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.prisma.newsAnalysis.findMany({ where, orderBy, skip, take: limit }),
      this.prisma.newsAnalysis.count({ where }),
    ]);

    return { items, total, page, limit };
  }

  async update(id: number, data: UpdateNewsAnalysisDto): Promise<NewsAnalysis> {
    await this.ensureExists(id);
    return this.prisma.newsAnalysis.update({ where: { id }, data });
  }

  async delete(id: number): Promise<NewsAnalysis> {
    // Soft delete via status -> InActive (0)
    await this.ensureExists(id);
    return this.prisma.newsAnalysis.update({
      where: { id },
      data: { status: DefaultStatusEnum.InActive },
    });
  }

  async restore(id: number): Promise<NewsAnalysis> {
    await this.ensureExists(id);
    return this.prisma.newsAnalysis.update({
      where: { id },
      data: { status: DefaultStatusEnum.Active },
    });
  }

  private async ensureExists(id: number): Promise<void> {
    const exists = await this.prisma.newsAnalysis.findUnique({ where: { id } });
    if (!exists) throw new NotFoundException('NewsAnalysis not found');
  }
}
