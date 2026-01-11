import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNewsDto {
  @ApiPropertyOptional({
    description: 'Yangilik manbasi (masalan: GLOBENEWSWIRE, PRNEWSWIRE)',
    example: 'GLOBENEWSWIRE',
  })
  source?: string;

  @ApiProperty({
    description: 'Yangilik tegishli bo‘lgan kompaniya tickerlari',
    example: ['AAPL', 'MSFT'],
    isArray: true,
  })
  tickers: string[];

  @ApiPropertyOptional({
    description: 'Yangilik sarlavhasi',
    example: 'Company Reports Strong Q4 Earnings Growth',
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Yangilik to‘liq matni',
    example:
      'The company announced a significant increase in revenue driven by strong consumer demand...',
  })
  content?: string;

  @ApiPropertyOptional({
    description: 'haloligi',
    example:
      'halal',
  })
  halalStatus?: string;

  @ApiPropertyOptional({
    description: 'Yangilik chiqqan vaqt (ISO 8601 formatida, UTC yoki ET)',
    example: '2025-12-08T09:43:00-05:00',
  })
  newsTime?: Date;
}
