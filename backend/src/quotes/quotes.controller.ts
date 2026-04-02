import { Controller, Get, Post, Body } from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  @Get('random')
  @ApiOperation({ summary: 'Get a random quote' })
  @ApiResponse({ status: 200, description: 'Returns a random quote' })
  async getRandomQuote() {
    return this.quotesService.getRandomQuote();
  }

  @Get()
  @ApiOperation({ summary: 'Get all active quotes' })
  @ApiResponse({ status: 200, description: 'Returns all active quotes' })
  async getAllQuotes() {
    return this.quotesService.getAllQuotes();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new quote' })
  @ApiResponse({ status: 201, description: 'Quote created successfully' })
  async createQuote(
    @Body()
    body: {
      text: string;
      author: string;
      source?: string;
      category?: string;
    },
  ) {
    return this.quotesService.createQuote(body);
  }
}
