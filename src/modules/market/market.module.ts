import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MarketController } from './market.controller';
import { FinnhubService } from './finnhub.service';

@Module({
  imports: [ConfigModule],
  controllers: [MarketController],
  providers: [FinnhubService],
  exports: [FinnhubService],
})
export class MarketModule {}
