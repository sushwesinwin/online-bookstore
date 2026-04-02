import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QuotesService {
  constructor(private prisma: PrismaService) {}

  async getRandomQuote() {
    // Get count of active quotes
    const count = await this.prisma.quote.count({
      where: { isActive: true },
    });

    if (count === 0) {
      return null;
    }

    // Generate random skip value
    const randomSkip = Math.floor(Math.random() * count);

    // Get random quote
    const quote = await this.prisma.quote.findFirst({
      where: { isActive: true },
      skip: randomSkip,
    });

    return quote;
  }

  async getAllQuotes() {
    return this.prisma.quote.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createQuote(data: {
    text: string;
    author: string;
    source?: string;
    category?: string;
  }) {
    return this.prisma.quote.create({
      data,
    });
  }
}
