import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CartItem } from '@prisma/client';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: {
        book: true,
      },
    });

    const total = cartItems.reduce((sum, item) => {
      return sum + item.book.price.toNumber() * item.quantity;
    }, 0);

    return {
      items: cartItems,
      total,
      itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    };
  }

  async addItem(userId: string, addToCartDto: AddToCartDto): Promise<CartItem> {
    const { bookId, quantity } = addToCartDto;

    // Check if book exists and has sufficient inventory
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.inventory < quantity) {
      throw new BadRequestException(
        `Insufficient inventory. Available: ${book.inventory}, Requested: ${quantity}`,
      );
    }

    // Check if item already exists in cart
    const existingItem = await this.prisma.cartItem.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (existingItem) {
      // Update existing item
      const newQuantity = existingItem.quantity + quantity;

      if (book.inventory < newQuantity) {
        throw new BadRequestException(
          `Insufficient inventory. Available: ${book.inventory}, Total requested: ${newQuantity}`,
        );
      }

      return await this.prisma.cartItem.update({
        where: {
          userId_bookId: {
            userId,
            bookId,
          },
        },
        data: { quantity: newQuantity },
        include: { book: true },
      });
    }

    // Create new cart item
    return await this.prisma.cartItem.create({
      data: {
        userId,
        bookId,
        quantity,
      },
      include: { book: true },
    });
  }

  async updateItem(
    userId: string,
    itemId: string,
    updateCartItemDto: UpdateCartItemDto,
  ): Promise<CartItem> {
    const { quantity } = updateCartItemDto;

    // Find the cart item
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId,
      },
      include: { book: true },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // Check inventory
    if (cartItem.book.inventory < quantity) {
      throw new BadRequestException(
        `Insufficient inventory. Available: ${cartItem.book.inventory}, Requested: ${quantity}`,
      );
    }

    return await this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { book: true },
    });
  }

  async removeItem(userId: string, itemId: string): Promise<void> {
    const cartItem = await this.prisma.cartItem.findFirst({
      where: {
        id: itemId,
        userId,
      },
    });

    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    await this.prisma.cartItem.delete({
      where: { id: itemId },
    });
  }

  async clearCart(userId: string): Promise<void> {
    await this.prisma.cartItem.deleteMany({
      where: { userId },
    });
  }

  async validateCartItems(
    userId: string,
  ): Promise<{ valid: boolean; issues: string[] }> {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { book: true },
    });

    const issues: string[] = [];

    for (const item of cartItems) {
      if (item.book.inventory < item.quantity) {
        issues.push(
          `"${item.book.title}" has insufficient inventory. Available: ${item.book.inventory}, In cart: ${item.quantity}`,
        );
      }
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}
