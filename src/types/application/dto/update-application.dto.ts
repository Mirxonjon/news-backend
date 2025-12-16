import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNewsDto {
  @ApiPropertyOptional({
    description: 'Yangilik manbasi',
    example: 'PRNEWSWIRE',
  })
  source?: string;

  @ApiPropertyOptional({
    description: 'Kompaniya tickerlari',
    example: ['AAPL', 'MSFT'],
    isArray: true,
  })
  tickers?: string[];

  @ApiPropertyOptional({
    description: 'Yangilik sarlavhasi',
    example: 'Company Updates Guidance',
  })
  title?: string;

  @ApiPropertyOptional({
    description: 'Yangilik matni',
  })
  content?: string;

  @ApiPropertyOptional({
    description: 'Yangilik vaqti (ISO)',
    example: '2025-12-09T10:15:00-05:00',
  })
  newsTime?: Date;

  @ApiPropertyOptional({
    description: 'Yangilik statusi (1=active, 0=deleted)',
    example: 1,
  })
  status?: number;
}
