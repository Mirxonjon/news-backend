import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import * as stats from 'simple-statistics';

@Injectable()
export class FinnhubService {
  private readonly logger = new Logger(FinnhubService.name);
  private readonly base = 'https://finnhub.io/api/v1';
  private readonly token: string;

  constructor(private readonly config: ConfigService) {
    this.token =
      this.config.get<string>('FINNHUB_API_KEY') || process.env.FINNHUB_API_KEY;
    if (!this.token) {
      this.logger.error('FINNHUB_API_KEY not set in env/config');
    }
  }

  private async request<T>(
    path: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    const url = `${this.base}/${path}`;
    const res = await axios.get<T>(url, {
      params: { ...params, token: this.token },
      timeout: 10_000,
    });
    return res.data;
  }

  // company profile
  async getProfile(symbol: string) {
    return this.request<any>(`stock/profile2`, { symbol });
  }

  // real-time quote
  async getQuote(symbol: string) {
    return this.request<any>(`quote`, { symbol });
  }

  // candles for ATR/volatility (resolution: D, W, M, 1, 5, 15 ...)

  async getCandles(symbol: string, count = 100) {
    const url = `https://stooq.com/q/d/l/?s=${symbol.toLowerCase()}.us&i=d`;
    const res = await axios.get(url, { responseType: 'text' });

    const rows = res.data.trim().split('\n');

    const data = rows.slice(1).map((line) => {
      const [date, open, high, low, close, volume] = line.split(',');

      return {
        date,
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
        volume: parseInt(volume),
      };
    });

    // Faqat oxirgi N kundagi ma'lumot
    return data.slice(-count);
  }

  // ATR calculation (period default 14)
  async getATR(symbol: string, period = 14, count = 100) {
    // oxirgi count candle (Stooq'dan)
    const candles = await this.getCandles(symbol, count);

    // kam data bo'lsa — ATR hisoblanmaydi
    if (!candles || candles.length < period + 1) return null;

    const trueRanges: number[] = [];

    for (let i = 1; i < candles.length; i++) {
      const prev = candles[i - 1];
      const cur = candles[i];

      const tr = Math.max(
        cur.high - cur.low, // High - Low
        Math.abs(cur.high - prev.close), // High - PrevClose
        Math.abs(cur.low - prev.close) // Low - PrevClose
      );

      trueRanges.push(tr);
    }

    // oxirgi "period" TR larni o'rtachasi
    const recent = trueRanges.slice(-period);
    const atr = recent.reduce((a, b) => a + b, 0) / recent.length;

    return {
      atr,
      period,
      lastClose: candles[candles.length - 1].close,
    };
  }

  // volatility (stddev of returns % over days)
  async getVolatility(symbol: string, days = 30) {
    // ATRdagi kabi oxirgi 60 ta candle olish (30 returns uchun)
    const candles = await this.getCandles(symbol, Math.max(days + 1, 60));

    if (!candles || candles.length < days + 1) {
      return null;
    }

    // faqat close qiymatlarini olish
    const closes = candles.map((c) => c.close);

    const returns: number[] = [];

    // oxirgi `days` kunlik returns hisoblash
    for (let i = closes.length - days; i < closes.length; i++) {
      const prev = closes[i - 1];
      const cur = closes[i];
      const r = (cur - prev) / prev;
      returns.push(r * 100); // % format
    }

    // volatility = standard deviation
    const volatilityPercent = stats.standardDeviation(returns);

    // average daily return
    const meanReturnPercent = stats.mean(returns);

    return {
      days,
      volatilityPercent,
      meanReturnPercent,
    };
  }

  // combine basic context for AI prompt
  async getMarketContext(symbol: string): Promise<any> {
    const [profile, quote, atrObj, volObj] = await Promise.all([
      this.getProfile(symbol),
      this.getQuote(symbol),
      this.getATR(symbol, 14, 100),
      this.getVolatility(symbol, 30),
    ]);

    const marketCap = profile?.marketCapitalization ?? null;
    const shareOutstanding = profile?.shareOutstanding ?? null;
    const sector = profile?.finnhubIndustry ?? profile?.industry ?? null;
    const exchange = profile?.exchange ?? null;
    const price = quote?.c ?? null;
    const dailyChangePercent = quote?.dp ?? null;
    const intradayHigh = quote?.h ?? null;
    const intradayLow = quote?.l ?? null;
    const atr = atrObj?.atr ?? null;
    const volatility = volObj?.volatilityPercent ?? null;

    const context = {
      symbol,
      name: profile?.name ?? null,
      marketCap,
      shareOutstanding,
      sector,
      exchange,
      price,
      dailyChangePercent,
      intradayHigh,
      intradayLow,
      atr,
      volatility,
      rawProfile: profile,
      rawQuote: quote,
    };

    // string summary for prompt injection
    const summary = `
Name: ${context.name || symbol}
Symbol: ${symbol}
Market Cap (USD millions): ${marketCap || 'N/A'}
Share Outstanding (M): ${shareOutstanding || 'N/A'}
Sector: ${sector || 'N/A'}
Exchange: ${exchange || 'N/A'}
Price: ${price ?? 'N/A'}
Daily change %: ${dailyChangePercent ?? 'N/A'}
Intraday high/low: ${intradayHigh ?? 'N/A'} / ${intradayLow ?? 'N/A'}
ATR(14): ${atr ?? 'N/A'}
30d volatility (% stddev): ${volatility ?? 'N/A'}
`.trim();

    return { context, summary };
  }
}
