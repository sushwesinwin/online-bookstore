import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class BlogsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createBlogDto: CreateBlogDto) {
    return this.prisma.blogPost.create({
      data: {
        title: createBlogDto.title.trim(),
        content: createBlogDto.content.trim(),
        featureImage: createBlogDto.featureImage?.trim() || null,
        fontFamily: createBlogDto.fontFamily ?? 'modern-sans',
        visibility: createBlogDto.visibility ?? 'PUBLIC',
        authorId: userId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  async findAll(userId?: string) {
    const where: Prisma.BlogPostWhereInput = userId
      ? {
          OR: [{ visibility: 'PUBLIC' }, { authorId: userId }],
        }
      : {
          visibility: 'PUBLIC',
        };

    if (userId) {
      where.OR?.push(
        {
          visibility: 'FOLLOWERS',
          author: {
            followers: {
              some: {
                followerId: userId,
              },
            },
          },
        },
        {
          visibility: 'FRIENDS',
          author: {
            OR: [
              {
                friendshipsStarted: {
                  some: {
                    userTwoId: userId,
                  },
                },
              },
              {
                friendshipsReceived: {
                  some: {
                    userOneId: userId,
                  },
                },
              },
            ],
          },
        },
      );
    }

    return this.prisma.blogPost.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId?: string) {
    return this.prisma.blogPost.findFirst({
      where: userId
        ? {
            id,
            OR: [
              { visibility: 'PUBLIC' },
              { authorId: userId },
              {
                visibility: 'FOLLOWERS',
                author: {
                  followers: {
                    some: {
                      followerId: userId,
                    },
                  },
                },
              },
              {
                visibility: 'FRIENDS',
                author: {
                  OR: [
                    {
                      friendshipsStarted: {
                        some: {
                          userTwoId: userId,
                        },
                      },
                    },
                    {
                      friendshipsReceived: {
                        some: {
                          userOneId: userId,
                        },
                      },
                    },
                  ],
                },
              },
            ],
          }
        : {
            id,
            visibility: 'PUBLIC',
          },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }
}
