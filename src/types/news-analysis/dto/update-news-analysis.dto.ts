import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, IsNotEmpty } from 'class-validator';

export class UpdateNewsAnalysisDto {
  @ApiPropertyOptional({ description: 'Ticker symbol', example: 'AAPL' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  ticker?: string;

  @ApiPropertyOptional({ description: 'Sentiment label', example: 'negative' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  sentiment?: string;

  @ApiPropertyOptional({ description: 'Model confidence (0-100)', example: 90, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  confidence?: number;

  @ApiPropertyOptional({ description: 'Impact type', example: 'volume' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  impactType?: string;

  @ApiPropertyOptional({ description: 'Impact strength (0-100)', example: 70, minimum: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  impactStrength?: number;

  @ApiPropertyOptional({ description: 'Expected min move', example: 40 })
  @IsOptional()
  @IsInt()
  expectedMin?: number;

  @ApiPropertyOptional({ description: 'Expected max move', example: 160 })
  @IsOptional()
  @IsInt()
  expectedMax?: number;

  @ApiPropertyOptional({ description: 'Reasoning text' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  reason?: string;

  @ApiPropertyOptional({ description: 'Status (1=active, 0=inactive)', example: 1 })
  @IsOptional()
  @IsInt()
  status?: number;
}
