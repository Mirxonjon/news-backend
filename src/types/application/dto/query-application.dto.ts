import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetAllNewsDto {
  @ApiPropertyOptional({
    description: 'Ticker bo‘yicha filter',
    example: 'AAPL',
  })
  ticker?: string;

  @ApiPropertyOptional({
    description: 'Status (1=active, 0=deleted)',
    example: 1,
  })
  status?: number;

  @ApiPropertyOptional({
    description: 'Sahifa raqami',
    example: 1,
  })
  page?: number;

  @ApiPropertyOptional({
    description: 'Sahifadagi elementlar soni',
    example: 20,
  })
  limit?: number;
}
