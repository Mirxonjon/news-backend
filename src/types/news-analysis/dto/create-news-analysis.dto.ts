import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateNewsAnalysisDto {
  @ApiProperty({ description: 'Related News ID', example: 123 })
  @IsInt()
  newsId: number;

  @ApiProperty({ description: 'Ticker symbol', example: 'AAPL' })
  @IsString()
  @IsNotEmpty()
  ticker: string;

  @ApiProperty({ description: 'Sentiment label', example: 'positive' })
  @IsString()
  @IsNotEmpty()
  sentiment: string;

  @ApiProperty({ description: 'Model confidence (0-100)', example: 85, minimum: 0 })
  @IsInt()
  @Min(0)
  confidence: number;

  @ApiProperty({ description: 'Impact type', example: 'price' })
  @IsString()
  @IsNotEmpty()
  impactType: string;

  @ApiProperty({ description: 'Impact strength (0-100)', example: 60, minimum: 0 })
  @IsInt()
  @Min(0)
  impactStrength: number;

  @ApiProperty({ description: 'Expected min move (bps or cents)', example: 50 })
  @IsInt()
  expectedMin: number;

  @ApiProperty({ description: 'Expected max move (bps or cents)', example: 150 })
  @IsInt()
  expectedMax: number;

  @ApiProperty({ description: 'Reasoning text' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'Status (1=active, 0=inactive)', example: 1 })
  @IsOptional()
  @IsInt()
  status?: number;
}
