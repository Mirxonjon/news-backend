import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  TelegramConfig,
  appConfig,
  dbConfig,
  minioConfig,
  openAIConfig,
} from './common/config/app.config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER } from '@nestjs/core';
import { NewsModule } from './modules/news/news.module';
import { CronJobModule } from './common/cron/cron.module';
import { NotificationsModule } from './common/services/notifications/notifications.module';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AllExceptionFilter } from './common/filter/all-exceptions.filter';
import { OpenaiModule } from './modules/openai/openai.module';
import { TelegramModule } from './external/telegram/telegram.module';
import { TelegrafModule } from 'nestjs-telegraf';
import { MarketModule } from './modules/market/market.module';
import { NewsAnalysisModule } from './modules/news-analysis/news-analysis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig, minioConfig, openAIConfig, TelegramConfig],
    }),
    TelegrafModule.forRoot({
      token: process.env.TELEGRAM_BOT_TOKEN,
    }),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     uri: configService.get<string>('db.url') || process.env.DATABASE_URL,
    //   }),
    //   inject: [ConfigService],
    // }),
    PrismaModule,
    NewsModule,
    NewsAnalysisModule,
    MarketModule,
    CronJobModule,
    NotificationsModule,
    OpenaiModule,
    TelegramModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionFilter,
    },
  ],
})
export class AppModule implements OnModuleInit {
  // constructor(
  //   private readonly userSeedService: UserSeedService,
  //   private readonly rolePermissionSeedService: RolePermissionSeedService
  // ) {}

  async onModuleInit() {
    // await this.rolePermissionSeedService.seed();
    // await this.userSeedService.seed();
  }
}
