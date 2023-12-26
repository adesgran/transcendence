import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class FriendslistService {
  constructor(private readonly prisma: PrismaService) {}

  async getList(id: number) {
    const friends = await this.prisma.friendship.findMany({
      where: {
        OR: [
          {
            user1_id: id,
            status: 'FRIENDS',
          },
          {
            user2_id: id,
            status: 'FRIENDS',
          },
        ],
      },
      include: {
        user1: true,
        user2: true,
      },
    });

    const friendsList = friends.map((friend) => {
      const user = friend.user1_id == id ? friend.user2 : friend.user1;
      return {
        userid: user.id,
        username: user.username,
        avatar_url: user.avatar_url,
        online: true,
      };
    });

    return friendsList;
  }

  async sendFriendRequest(senderId: number, receiverId: number) {
    if (!senderId || !receiverId) {
      throw new NotFoundException('Invalid senderId or receiverId');
    }

    const existingFriendship = await this.prisma.friendship.findFirst({
      where: {
        OR: [
          { user1_id: senderId, user2_id: receiverId },
          { user1_id: receiverId, user2_id: senderId },
        ],
      },
    });

    if (existingFriendship) {
      if (existingFriendship.status === 'BLOCKED') {
        throw new NotFoundException('Friendship is blocked');
      } else if (existingFriendship.status === 'PENDING') {
        if (existingFriendship.user2_id === senderId) {
          const updatedFriendship = await this.prisma.friendship.update({
            where: { id: existingFriendship.id },
            data: { status: 'FRIENDS' },
          });
          return updatedFriendship;
        } else {
          throw new NotFoundException('Pending request already exists');
        }
      } else {
        throw new NotFoundException('Friendship already exists');
      }
    }

    const newFriendship = await this.prisma.friendship.create({
      data: {
        user1_id: senderId,
        user2_id: receiverId,
        status: 'PENDING',
      },
    });

    return newFriendship;
  }

  async getPotentialFriends(placeholderValue: string, selfId: number) {
    try {
      const normalizedPlaceholder = placeholderValue.toLowerCase();

      const potentialFriends = await this.prisma.user.findMany({
        where: {
          username: {
            contains: normalizedPlaceholder,
            mode: 'insensitive',
          },
          AND: {
            AND: [
              {
                id: {
                  not: selfId,
                },
              },
              {
                friendship_user1: {
                  none: {
                    OR: [
                      { status: { equals: 'FRIENDS' }, user2_id: selfId },
                      { status: { equals: 'BLOCKED' }, user2_id: selfId },
                    ],
                  },
                },
              },
              {
                friendship_user2: {
                  none: {
                    OR: [
                      { status: { equals: 'FRIENDS' }, user1_id: selfId },
                      { status: { equals: 'BLOCKED' }, user1_id: selfId },
                    ],
                  },
                },
              },
            ],
          },
        },
        select: {
          id: true,
        },
        orderBy: {
          username: 'asc',
        },
      });

      return potentialFriends.map((user) => user.id);
    } catch (error) {
      console.error('Error fetching potential friends:', error);
      throw error;
    }
  }
}
