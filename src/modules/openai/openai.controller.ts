import { Controller, Post, Body } from '@nestjs/common';
import { OpenaiService } from './openai.service';

@Controller('ai')
export class OpenaiController {
  constructor(private readonly openaiService: OpenaiService) {}

  @Post('ask')
  async ask(@Body('prompt') prompt: string) {
    const result = await this.openaiService.askGPT(prompt);
    return { result };
  }

  @Post('analyse')
  async analyse(@Body('text') text: string) {
    const result = await this.openaiService.analyseNews(text);
    return { analysis: result };
  }
}
