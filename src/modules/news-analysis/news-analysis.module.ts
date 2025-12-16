import { Module } from '@nestjs/common';
import { PrismaModule } from '@/modules/prisma/prisma.module';
import { NewsAnalysisService } from './news-analysis.service';
import { NewsAnalysisController } from './news-analysis.controller';

@Module({
  imports: [PrismaModule],
  controllers: [NewsAnalysisController],
  providers: [NewsAnalysisService],
  exports: [NewsAnalysisService],
})
export class NewsAnalysisModule {}
