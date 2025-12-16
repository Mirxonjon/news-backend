import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ListQueryWithStatusDto } from '@/types/global/dto/list-query-with-status';

export class QueryNewsAnalysisDto extends ListQueryWithStatusDto {
  @ApiPropertyOptional({ description: 'Filter by ticker', example: 'AAPL' })
  @IsOptional()
  @IsString()
  ticker?: string;

  @ApiPropertyOptional({ description: 'Filter by sentiment', example: 'positive' })
  @IsOptional()
  @IsString()
  sentiment?: string;

  @ApiPropertyOptional({ description: 'Filter by related newsId', example: 123 })
  @IsOptional()
  @Type(() => Number)
  newsId?: number;

  @ApiPropertyOptional({ description: 'CreatedAt from (ISO date)', example: '2025-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiPropertyOptional({ description: 'CreatedAt to (ISO date)', example: '2025-01-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  dateTo?: string;
}
