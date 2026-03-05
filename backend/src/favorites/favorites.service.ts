import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async getUserFavorites(userId: string) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: {
        book: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return favorites.map(fav => fav.book);
  }

  async addFavorite(userId: string, bookId: string) {
    // Check if book exists
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Check if already in favorites
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('Book is already in favorites');
    }

    await this.prisma.favorite.create({
      data: {
        userId,
        bookId,
      },
    });

    return { message: 'Added to favorites successfully' };
  }

  async removeFavorite(userId: string, bookId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (!existing) {
      throw new NotFoundException('Book is not in favorites');
    }

    await this.prisma.favorite.delete({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    return { message: 'Removed from favorites successfully' };
  }
}
