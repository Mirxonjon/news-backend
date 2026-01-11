import { Injectable } from '@nestjs/common';
import { InjectBot } from 'nestjs-telegraf';
import { Telegraf, Context } from 'telegraf';

@Injectable()
export class TelegramService {
  private sentimentTopicMapPenny = {
    good: Number(process.env.TELEGRAM_TOPIC_ID_GOOD_NEWS),
    neutral: Number(process.env.TELEGRAM_TOPIC_ID_NEYRTAL_NEWS),
    bad: Number(process.env.TELEGRAM_TOPIC_ID_BAD_NEWS),
  };
  private sentimentTopicMapMid = {
    good: Number(process.env.TELEGRAM_TOPIC_ID_MID_GOOD_NEWS),
    neutral: Number(process.env.TELEGRAM_TOPIC_ID_MID_NEYRTAL_NEWS),
    bad: Number(process.env.TELEGRAM_TOPIC_ID_MID_BAD_NEWS),
  };
  private sentimentTopicMapMega = {
    good: Number(process.env.TELEGRAM_TOPIC_ID_MEGA_GOOD_NEWS),
    neutral: Number(process.env.TELEGRAM_TOPIC_ID_MEGA_NEYRTAL_NEWS),
    bad: Number(process.env.TELEGRAM_TOPIC_ID_MEGA_BAD_NEWS),
  };

  private sentimentTopicMapAnalyst = {
    good: Number(process.env.TELEGRAM_TOPIC_ID_ANALYST_GOOD_NEWS),
    neutral: Number(process.env.TELEGRAM_TOPIC_ID_ANALYST_NEYRTAL_NEWS),
    bad: Number(process.env.TELEGRAM_TOPIC_ID_ANALYST_BAD_NEWS),
  };

  constructor(@InjectBot() private readonly bot: Telegraf<Context>) {
    this.setupBot();
  }

  private setupBot() {
    // /start komandasi
    this.bot.start((ctx) => {
      const chatId = ctx.chat.id;

      ctx.reply(`Bot ishga tushdi!\nChat ID: ${chatId}`);

      console.log('START chatId:', chatId);
    });

    // Har qanday text xabar
    this.bot.on('text', (ctx) => {
      const chatId = ctx.chat.id;
      const username = ctx.chat.id || 'no_username';

      console.log('Message from:', {
        chatId,
        username,
        text: ctx.message.text,
      });

      ctx.reply(`Qabul qildim.\nChat ID: ${chatId}`);
    });
  }

  async sendToGroup(
    text: string,
    topicId?: number,
    analyst_signal?: string,
    options: { parseMode?: 'HTML' | 'Markdown' } = {}
  ) {
    try {
      let chatId = process.env.TELEGRAM_GROUP_ID || '@news_day_scrapping';

      if (analyst_signal == 'yes') {
        chatId = process.env.TELEGRAM_ANALYST_GROUP_ID || '@analytik_fikrilar';
      }

      if (!chatId) {
        // this.logger.error('TELEGRAM_CHAT_ID topilmadi!');
        return;
      }

      const result = await this.bot.telegram.sendMessage(chatId, text, {
        parse_mode: options.parseMode || 'HTML',
        message_thread_id: topicId,
      });
      // console.log(result);
      return result;
    } catch (error) {
      // this.logger.error('Guruhga xabar yuborishda xato:', error);
      throw new Error('Telegram guruhga xabar yuborilmadi');
    }
  }
  getTopicIdBySentiment(
    sentiment: 'good' | 'neutral' | 'bad' | 'analyst',
    tier: 'PENNY' | 'MID' | 'MEGA'
  ): number {
    if (tier === 'PENNY') {
      return this.sentimentTopicMapPenny[sentiment];
    } else if (tier === 'MEGA') {
      return this.sentimentTopicMapMega[sentiment];
    } else if (tier === 'MID') {
      return this.sentimentTopicMapMid[sentiment];
    }
  }

  getTopicIdBySentimentAnalysist(
    sentiment: 'good' | 'neutral' | 'bad' | 'analyst'
  ): number {
    return this.sentimentTopicMapAnalyst[sentiment];
  }
}
