import { Injectable, Logger } from '@nestjs/common';
import {
  CreateNewsDto,
  GetAllNewsDto,
  UpdateNewsDto,
} from '@/types/application';
import { RequestWithUser } from '@/types/global';
import { TelegramService } from '@/external/telegram/telegram.service';
import { FinnhubService } from '../market/finnhub.service';
import { OpenaiService } from '../openai/openai.service';
import { PrismaService } from '../prisma/prisma.service';
import { NewsAnalysisService } from '../news-analysis/news-analysis.service';
import axios from 'axios';
import { Cron, CronExpression } from '@nestjs/schedule';
import 'dotenv/config';

@Injectable()
export class NewsService {
  private logger = new Logger(NewsService.name);

  constructor(
    private readonly telegramService: TelegramService,
    private readonly marketService: FinnhubService,
    private readonly openaiService: OpenaiService,
    private readonly prisma: PrismaService,
    private readonly newsAnalysis: NewsAnalysisService
  ) {}

  async create(data: CreateNewsDto): Promise<any> {
    const methodName = this.create.name;
    this.logger.debug(`Method: ${methodName} - Creating news`);

    try {
      const news = await this.prisma.news.create({
        data: {
          source: data.source,
          tickers: data.tickers,
          title: data.title,
          content: data.content,
          newsTime: data.newsTime ?? null,
          halalStatus: data.halalStatus,
          uniqueKey: `${data.source}-${data.title}-${data.newsTime}`.trim(),
        },
      });

      return {
        success: true,
        news,
      };
    } catch (error) {
      this.logger.error(
        `Method: ${methodName} - Error creating news: ${error.message}`
      );
      throw error;
    }
  }

  async getById(id: number): Promise<any> {
    const methodName = this.getById.name;
    this.logger.debug(`Method: ${methodName} - id=${id}`);

    try {
      const news = await this.prisma.news.findUnique({
        where: { id },
      });

      if (!news) {
        throw new Error(`News not found (id=${id})`);
      }

      return {
        success: true,
        news,
      };
    } catch (error) {
      this.logger.error(`Method: ${methodName} - Error: ${error.message}`);
      throw error;
    }
  }

  async getAll(query: GetAllNewsDto): Promise<any> {
    const methodName = this.getAll.name;
    this.logger.debug(`Method: ${methodName} - Fetching news list`);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const skip = (page - 1) * limit;

    try {
      const where: any = {
        status: query.status ?? 1, // default faqat active
      };

      if (query.ticker) {
        where.tickers = {
          has: query.ticker.toUpperCase(),
        };
      }

      const [items, total] = await this.prisma.$transaction([
        this.prisma.news.findMany({
          where,
          orderBy: {
            newsTime: 'desc',
          },
          skip,
          take: limit,
        }),
        this.prisma.news.count({ where }),
      ]);

      return {
        success: true,
        page,
        limit,
        total,
        items,
      };
    } catch (error) {
      this.logger.error(`Method: ${methodName} - Error: ${error.message}`);
      throw error;
    }
  }

  async update(
    id: number,
    data: UpdateNewsDto,
    req: RequestWithUser
  ): Promise<any> {
    const methodName = this.update.name;
    this.logger.debug(`Method: ${methodName} - id=${id}`);

    try {
      const news = await this.prisma.news.update({
        where: { id },
        data: {
          source: data.source,
          tickers: data.tickers,
          title: data.title,
          content: data.content,
          newsTime: data.newsTime ?? undefined,
        },
      });

      return {
        success: true,
        news,
      };
    } catch (error) {
      this.logger.error(`Method: ${methodName} - Error: ${error.message}`);
      throw error;
    }
  }

  async delete(id: number): Promise<any> {
    const methodName = this.delete.name;
    this.logger.debug(`Method: ${methodName} - id=${id}`);

    try {
      const news = await this.prisma.news.update({
        where: { id },
        data: { status: 0 },
      });

      return {
        success: true,
        message: 'News soft-deleted',
        news,
      };
    } catch (error) {
      this.logger.error(`Method: ${methodName} - Error: ${error.message}`);
      throw error;
    }
  }

  async restore(id: number): Promise<any> {
    const methodName = this.restore.name;
    this.logger.debug(`Method: ${methodName} - id=${id}`);

    try {
      const news = await this.prisma.news.update({
        where: { id },
        data: { status: 1 },
      });

      return {
        success: true,
        message: 'News restored',
        news,
      };
    } catch (error) {
      this.logger.error(`Method: ${methodName} - Error: ${error.message}`);
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async processScrapedNews(): Promise<any> {
    const methodName = this.processScrapedNews.name;
    this.logger.debug(`Method: ${methodName} - Scrapingni boshlayapmiz`);

    try {
      const scraperBaseUrl = process.env.SCRAPER_BASE_URL;

      if (!scraperBaseUrl) {
        throw new Error('SCRAPER_BASE_URL is not defined');
      }
      // ========================================
      // 1️⃣ Python Scraper → Yangiliklarni olish
      // ========================================
      const response = await axios.get(`${scraperBaseUrl}/scrape`);
      const newsList = response.data;
      // const newsList = [
      //   {
      //     title: 'Top Wealth Group (TWG) Signals a Turnaround Year',
      //     description: `Top Wealth Group, the premium caviar and fine-wine supplier, projected at least $4 million net profit for FY2025 — a sharp reversal from last year's $2 million loss. Management attributed the turnaround to major operational improvements throughout 2024. This news signals strong recovery momentum and renewed investor confidence for TWG.`,
      //     ticker: ['TWG'],
      //     source: 'GLOBENEWSWIRE',
      //     date: '2025-12-08T19:43:00',
      //   },
      // ];
      console.log(newsList);

      this.logger.debug(
        `Method: ${methodName} - Scraping tugadi. Olingan yangiliklar soni: ${newsList.length}`
      );

      if (!newsList || newsList.length === 0) {
        return { success: false, message: 'Yangilik topilmadi' };
      }

      const results = [];

      // ========================================
      //  🔁 LOOP — Har bir yangilik uchun ishlaymiz
      // ========================================
      for (const news of newsList) {
        try {
          // 1️⃣ Tickerlar mavjudligini tekshiramiz
          // if (
          //   !Array.isArray(news.halal_status) ||
          //   news.halal_status.length === 0
          // ) {
          //   this.logger.warn(`Ticker topilmadi, yangilik o'tkazib yuborildi`);
          //   continue;
          // }
          let date = news.date ? new Date(news.date) : null;
          const uniqueKey = `${news.source}-${news.title}-${date}`.trim();

          const existsUniqueKey = await this.prisma.news.findUnique({
            where: {
              uniqueKey,
            },
          });
          if (existsUniqueKey) {
            // ⛔ Oldin kelgan yangilik
            this.logger.warn(
              `Bu yangilik bazada mavjud, yangilik o'tkazib yuborildi`
            );
            continue;
            // return {
            //   status: 'SKIPPED',
            //   reason: 'News already exists',
            // };
          }

          const createdNews = await this.create({
            source: news.source ?? 'scraper',
            tickers: news.ticker, // ["CTGO", "DVS"]
            title: news.title,
            content: news.description,
            // halalStatus: news.halal_status,
            newsTime: date,
          });
          this.logger.debug(`create news: ${JSON.stringify(createdNews)}`);
          const newsId = createdNews.news.id;

          // 2️⃣ Har bir ticker bo‘yicha alohida ishlaymiz
          for (const rawTicker of news.halal_status) {
            try {
              if (!rawTicker) continue;

              // if (rawTicker.status == 'NOT HALAL') {
              //   this.logger.warn(
              //     `Ticker halal emas, yangilik o'tkazib yuborildi`
              //   );
              //   continue;
              // }
              const ticker = rawTicker.ticker.toUpperCase();

              // 3️⃣ Market data
              const marketData =
                await this.marketService.getMarketContext(ticker);

              this.logger.debug(
                `Market context olindi (${ticker}): ${JSON.stringify(marketData)}`
              );

              // 4️⃣ AI tahlil (TICKER NI PROMPTGA BERYAPMIZ)
              const aiResult = await this.openaiService.analyseNewsWithMarket(
                ticker,
                news.title,
                news.description,
                marketData
              );
              this.logger.debug(
                `AI natija (${ticker}): ${JSON.stringify(aiResult)}`
              );

              const analysis = await this.newsAnalysis.create({
                newsId: newsId,
                ticker: ticker,

                sentiment: aiResult.sentiment,
                confidence: aiResult.confidence,

                impactType: aiResult.impact_type,
                impactStrength: aiResult.impact_strength,

                expectedMin: aiResult.expected_move_percent.min,
                expectedMax: aiResult.expected_move_percent.max,

                reason: aiResult.reason,
                status: 1,
              });

              this.logger.debug(
                `create news analysis: ${JSON.stringify(analysis)}`
              );
              const companyPrice = marketData.context.price;
              let topicId = 0;
              const sentiment =
                aiResult?.sentiment?.toLowerCase() === 'ijobiy'
                  ? 'good'
                  : aiResult?.sentiment?.toLowerCase() === 'salbiy'
                    ? 'bad'
                    : 'neutral';

              if (aiResult.analyst_signal == 'yes') {
                topicId =
                  this.telegramService.getTopicIdBySentimentAnalysist(
                    sentiment
                  );
              } else {
                if (companyPrice < 5) {
                  topicId = this.telegramService.getTopicIdBySentiment(
                    sentiment,
                    'PENNY'
                  );
                } else if (companyPrice >= 5 && companyPrice <= 100) {
                  topicId = this.telegramService.getTopicIdBySentiment(
                    sentiment,
                    'MID'
                  );
                } else if (companyPrice > 100) {
                  topicId = this.telegramService.getTopicIdBySentiment(
                    sentiment,
                    'MEGA'
                  );
                }
              }

              const tgMessage = `
          <b>📢 Yangi yangilik (${ticker}):</b>

          ${news.title}

 <b>AI tahlili:</b>
• <b>Sentiment:</b> ${aiResult.sentiment}
• <b>Impact Type:</b> ${aiResult.impact_type}
• <b>Impact Strength:</b> ${aiResult.impact_strength}/100
• <b>Expected Move:</b> ${aiResult.expected_move_percent.min}% → ${aiResult.expected_move_percent.max}%
• <b>AI Confidence:</b> ${aiResult.confidence}%
• <b>Reason:</b> ${aiResult.reason}

 <b>🧮 Market ma'lumotlar:</b>
 • <b>Price:</b> $${marketData.context.price}
 • <b>ATR(14):</b> ${marketData.context.atr.toFixed(2)}
• <b>Volatility (30d):</b> ${marketData.context.volatility.toFixed(2)}%
• <b>Market Cap:</b> $${await this.formatNumber(marketData.context.marketCap)}

• <b>Halal status:${rawTicker.status}</b>
#${ticker}
                  `;

              await this.telegramService.sendToGroup(
                tgMessage,
                topicId,
                aiResult.analyst_signal
              );

              // 7️⃣ Natijalarni saqlaymiz
              results.push({
                ticker,
                news,
                market: marketData,
                analysis: aiResult,
                sentiment,
                sentToTopic: topicId,
              });

              // 8️⃣ Flood control
              await new Promise((res) => setTimeout(res, 600));
            } catch (tickerError) {
              this.logger.error(
                `Ticker ${rawTicker} bo‘yicha xato: ${tickerError.message}`
              );
            }
          }
        } catch (newsError) {
          this.logger.error(
            `News for-loop ichida umumiy xato: ${newsError.message}`
          );
        }
      }
    } catch (error) {
      this.logger.error(
        `Method: ${methodName} - Umumiy xatolik: ${error.message}`
      );

      return {
        success: false,
        message: 'Scraping yoki tahlil jarayonida umumiy xatolik',
      };
    }
  }

  async formatNumber(num: number): Promise<string> {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
    if (num >= 1_000) return (num / 1_000).toFixed(2) + 'K';
    return num.toFixed(2);
  }
}
