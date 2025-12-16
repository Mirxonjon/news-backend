import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NewsController } from './news.controller';
import { NewsService } from './news.service';

import { TelegramModule } from '@/external/telegram/telegram.module';
import { NotificationsModule } from '@/common/services/notifications/notifications.module';
import { MarketModule } from '../market/market.module';
import { OpenaiModule } from '../openai/openai.module';
import { NewsAnalysisModule } from '../news-analysis/news-analysis.module';

@Module({
  imports: [
    forwardRef(() => TelegramModule),
    NotificationsModule,
    MarketModule,
    OpenaiModule,
    NewsAnalysisModule,
  ],
  controllers: [NewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
