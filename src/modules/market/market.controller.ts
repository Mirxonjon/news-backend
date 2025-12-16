import { Controller, Get, Param } from '@nestjs/common';
import { FinnhubService } from './finnhub.service';

@Controller('market')
export class MarketController {
  constructor(private readonly fh: FinnhubService) {}

  @Get('profile/:symbol')
  async profile(@Param('symbol') symbol: string) {
    return {
      status: 200,
      data: await this.fh.getProfile(symbol.toUpperCase()),
    };
  }

  @Get('quote/:symbol')
  async quote(@Param('symbol') symbol: string) {
    return { status: 200, data: await this.fh.getQuote(symbol.toUpperCase()) };
  }

  @Get('candles/:symbol')
  async candles(@Param('symbol') symbol: string) {
    return {
      status: 200,
      data: await this.fh.getCandles(symbol.toUpperCase(), 100),
    };
  }

  @Get('context/:symbol')
  async context(@Param('symbol') symbol: string) {
    return {
      status: 200,
      data: await this.fh.getMarketContext(symbol.toUpperCase()),
    };
  }

  @Get('atr/:symbol')
  async atr(@Param('symbol') symbol: string) {
    return {
      status: 200,
      data: await this.fh.getATR(symbol.toUpperCase(), 14, 100),
    };
  }

  @Get('vol/:symbol')
  async vol(@Param('symbol') symbol: string) {
    return {
      status: 200,
      data: await this.fh.getVolatility(symbol.toUpperCase(), 30),
    };
  }
}
