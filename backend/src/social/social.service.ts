import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocialService {
  constructor(private prisma: PrismaService) {}

  private async ensureTargetUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private assertNotSelf(currentUserId: string, targetUserId: string) {
    if (currentUserId === targetUserId) {
      throw new BadRequestException('You cannot perform this action on yourself');
    }
  }

  private normalizeFriendPair(userAId: string, userBId: string) {
    return userAId < userBId
      ? { userOneId: userAId, userTwoId: userBId }
      : { userOneId: userBId, userTwoId: userAId };
  }

  async getRelationshipStatuses(currentUserId: string, targetUserIds: string[]) {
    const uniqueTargetIds = Array.from(
      new Set(targetUserIds.filter(targetUserId => targetUserId))
    );

    if (uniqueTargetIds.length === 0) {
      return [];
    }

    const [follows, friendships] = await Promise.all([
      this.prisma.userFollow.findMany({
        where: {
          followerId: currentUserId,
          followingId: {
            in: uniqueTargetIds,
          },
        },
        select: {
          followingId: true,
        },
      }),
      this.prisma.userFriendship.findMany({
        where: {
          OR: [
            {
              userOneId: currentUserId,
              userTwoId: {
                in: uniqueTargetIds,
              },
            },
            {
              userTwoId: currentUserId,
              userOneId: {
                in: uniqueTargetIds,
              },
            },
          ],
        },
        select: {
          userOneId: true,
          userTwoId: true,
        },
      }),
    ]);

    const followingIds = new Set(follows.map(follow => follow.followingId));
    const friendIds = new Set(
      friendships.map(friendship =>
        friendship.userOneId === currentUserId
          ? friendship.userTwoId
          : friendship.userOneId
      )
    );

    return uniqueTargetIds.map(targetUserId => ({
      userId: targetUserId,
      isFollowing: followingIds.has(targetUserId),
      isFriend: friendIds.has(targetUserId),
      isSelf: targetUserId === currentUserId,
    }));
  }

  async followUser(currentUserId: string, targetUserId: string) {
    this.assertNotSelf(currentUserId, targetUserId);
    await this.ensureTargetUserExists(targetUserId);

    const existingFollow = await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
      select: { id: true },
    });

    if (existingFollow) {
      throw new ConflictException('You are already following this writer');
    }

    await this.prisma.userFollow.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId,
      },
    });

    return { message: 'Writer followed successfully' };
  }

  async unfollowUser(currentUserId: string, targetUserId: string) {
    this.assertNotSelf(currentUserId, targetUserId);

    const existingFollow = await this.prisma.userFollow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
      select: { id: true },
    });

    if (!existingFollow) {
      throw new NotFoundException('You are not following this writer');
    }

    await this.prisma.userFollow.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId,
        },
      },
    });

    return { message: 'Writer unfollowed successfully' };
  }

  async addFriend(currentUserId: string, targetUserId: string) {
    this.assertNotSelf(currentUserId, targetUserId);
    await this.ensureTargetUserExists(targetUserId);

    const pair = this.normalizeFriendPair(currentUserId, targetUserId);

    const existingFriendship = await this.prisma.userFriendship.findUnique({
      where: {
        userOneId_userTwoId: pair,
      },
      select: { id: true },
    });

    if (existingFriendship) {
      throw new ConflictException('This writer is already in your friends list');
    }

    await this.prisma.userFriendship.create({
      data: pair,
    });

    return { message: 'Writer added as a friend' };
  }

  async removeFriend(currentUserId: string, targetUserId: string) {
    this.assertNotSelf(currentUserId, targetUserId);

    const pair = this.normalizeFriendPair(currentUserId, targetUserId);

    const existingFriendship = await this.prisma.userFriendship.findUnique({
      where: {
        userOneId_userTwoId: pair,
      },
      select: { id: true },
    });

    if (!existingFriendship) {
      throw new NotFoundException('This writer is not in your friends list');
    }

    await this.prisma.userFriendship.delete({
      where: {
        userOneId_userTwoId: pair,
      },
    });

    return { message: 'Writer removed from friends' };
  }
}
