import {
  HttpCode,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { DateTime } from 'luxon';

@Injectable()
export class UserChannelModerateService {
  constructor(private readonly prisma: PrismaService) {}

  async makeAdmin(
    selfId: number,
    targetId: number,
    channelId: number,
  ): Promise<void> {
    try {
      const selfUser = await this.prisma.userChannel.findFirst({
        where: {
          user_id: selfId,
          channel_id: channelId,
        },
      });

      if (!selfUser || selfUser.role === 'MEMBER') {
        throw new HttpException(
          'Insufficient privileges to make admin.',
          HttpStatus.FORBIDDEN,
        );
      }

      const userChannel = await this.prisma.userChannel.findFirst({
        where: {
          user_id: targetId,
          channel_id: channelId,
        },
      });

      if (!userChannel) {
        throw new HttpException(
          'User is not a member of the channel.',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.prisma.userChannel.update({
        where: {
          id: userChannel.id,
        },
        data: {
          role: 'ADMIN',
        },
      });
    } catch (error) {
      console.error('Error in makeAdmin:', error.message);
      throw error;
    }
  }

  async demoteAdmin(
    selfId: number,
    targetId: number,
    channelId: number,
  ): Promise<void> {
    try {
      const selfUser = await this.prisma.userChannel.findFirst({
        where: {
          user_id: selfId,
          channel_id: channelId,
        },
      });

      const targetUser = await this.prisma.userChannel.findFirst({
        where: {
          user_id: targetId,
          channel_id: channelId,
        },
      });

      if (!selfUser || selfUser.role !== 'OWNER') {
        throw new HttpException(
          'Insufficient privileges to demote admin.',
          HttpStatus.FORBIDDEN,
        );
      }

      if (!targetUser || targetUser.role !== 'ADMIN') {
        throw new HttpException(
          'User is not an admin on the channel.',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.prisma.userChannel.update({
        where: {
          id: targetUser.id,
        },
        data: {
          role: 'MEMBER',
        },
      });
    } catch (error) {
      console.error('Error in demoteAdmin:', error.message);
      throw error;
    }
  }

  async makeOwner(
    selfId: number,
    targetId: number,
    channelId: number,
  ): Promise<void> {
    try {
      const selfUser = await this.prisma.userChannel.findFirst({
        where: {
          user_id: selfId,
          channel_id: channelId,
        },
      });

      const targetUser = await this.prisma.userChannel.findFirst({
        where: {
          user_id: targetId,
          channel_id: channelId,
        },
      });

      if (!selfUser || selfUser.role !== 'OWNER') {
        throw new HttpException(
          'Insufficient privileges to make owner.',
          HttpStatus.FORBIDDEN,
        );
      }

      if (!targetUser) {
        throw new HttpException(
          'User is not on the channel.',
          HttpStatus.NOT_FOUND,
        );
      }

      await this.prisma.userChannel.update({
        where: {
          id: targetUser.id,
        },
        data: {
          role: 'OWNER',
        },
      });

      await this.prisma.userChannel.update({
        where: {
          id: selfUser.id,
        },
        data: {
          role: 'ADMIN',
        },
      });
    } catch (error) {
      console.error('Error in makeOwner:', error.message);
      throw error;
    }
  }

  async muteUser(
    selfId: number,
    targetId: number,
    channelId: number,
    endDate: Date,
  ) {
    try {
      if (selfId === targetId) {
        throw new HttpException(
          'Current user is target user.',
          HttpStatus.NOT_FOUND,
        );
      }

      const selfUser = await this.prisma.userChannel.findFirst({
        where: {
          user_id: selfId,
          channel_id: channelId,
        },
      });

      const targetUser = await this.prisma.userChannel.findFirst({
        where: {
          user_id: targetId,
          channel_id: channelId,
        },
      });

      if (!selfUser) {
        throw new HttpException(
          'Current user is not a member of the channel.',
          HttpStatus.NOT_FOUND,
        );
      }

      if (!targetUser) {
        throw new HttpException(
          'Target user is not a member of the channel.',
          HttpStatus.NOT_FOUND,
        );
      }

      if (
        selfUser.role === 'MEMBER' ||
        (selfUser.role === 'ADMIN' && targetUser.role !== 'MEMBER')
      ) {
        throw new HttpException(
          'Insufficient privileges to mute the user.',
          HttpStatus.FORBIDDEN,
        );
      }

      if (
        targetUser.mute &&
        DateTime.fromJSDate(targetUser.mute) > DateTime.now()
      ) {
        throw new HttpException(
          'User is already muted.',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.prisma.userChannel.update({
        where: {
          id: targetUser.id,
        },
        data: {
          mute: endDate,
        },
      });
    } catch (error) {
      console.error('Error in muteUser:', error.message);
      throw error;
    }
  }

  async unmuteUser(
    selfId: number,
    targetId: number,
    channelId: number,
  ): Promise<void> {
    try {
      if (selfId === targetId) {
        throw new HttpException(
          'Current user is the target user.',
          HttpStatus.NOT_FOUND,
        );
      }

      const selfUser = await this.prisma.userChannel.findFirst({
        where: {
          user_id: selfId,
          channel_id: channelId,
        },
      });

      const targetUser = await this.prisma.userChannel.findFirst({
        where: {
          user_id: targetId,
          channel_id: channelId,
        },
      });

      if (!selfUser) {
        throw new HttpException(
          'Current user is not a member of the channel.',
          HttpStatus.NOT_FOUND,
        );
      }

      if (!targetUser) {
        throw new HttpException(
          'Target user is not a member of the channel.',
          HttpStatus.NOT_FOUND,
        );
      }

      if (
        selfUser.role === 'MEMBER' ||
        (selfUser.role === 'ADMIN' && targetUser.role !== 'MEMBER')
      ) {
        throw new HttpException(
          'Insufficient privileges to unmute the user.',
          HttpStatus.FORBIDDEN,
        );
      }

      if (
        !targetUser.mute ||
        DateTime.fromJSDate(targetUser.mute) <= DateTime.now()
      ) {
        throw new HttpException(
          'User is not currently muted.',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.prisma.userChannel.update({
        where: {
          id: targetUser.id,
        },
        data: {
          mute: null,
        },
      });
    } catch (error) {
      console.error('Error in unmuteUser:', error.message);
      throw error;
    }
  }

  async banUser(selfId: number, targetId: number, channelId: number) {
    try {
      if (selfId === targetId) {
        throw new HttpException(
          'Current user is target user.',
          HttpStatus.NOT_FOUND,
        );
      }

      const selfUser = await this.prisma.userChannel.findFirst({
        where: {
          user_id: selfId,
          channel_id: channelId,
        },
      });

      const targetUser = await this.prisma.userChannel.findFirst({
        where: {
          user_id: targetId,
          channel_id: channelId,
        },
      });

      if (!selfUser) {
        throw new HttpException(
          'Current user is not a member of the channel.',
          HttpStatus.NOT_FOUND,
        );
      }

      if (!targetUser) {
        throw new HttpException(
          'Target user is not a member of the channel.',
          HttpStatus.NOT_FOUND,
        );
      }

      if (
        selfUser.role === 'MEMBER' ||
        (selfUser.role === 'ADMIN' && targetUser.role !== 'MEMBER')
      ) {
        throw new HttpException(
          'Insufficient privileges to ban the user.',
          HttpStatus.FORBIDDEN,
        );
      }

      const channel = await this.prisma.channel.findUnique({
        where: {
          id: channelId,
        },
        include: {
          banList: true,
        },
      });

      if (!channel) {
        throw new HttpException('Channel not found.', HttpStatus.NOT_FOUND);
      }

      const isUserAlreadyBanned = channel.banList.some(
        (bannedUser) => bannedUser.id === targetId,
      );

      if (isUserAlreadyBanned) {
        throw new HttpException(
          'User is already banned.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedChannel = await this.prisma.channel.update({
        where: {
          id: channelId,
        },
        data: {
          banList: {
            connect: [{ id: targetId }],
          },
        },
      });

      await this.prisma.userChannel.delete({
        where: {
          id: targetUser.id,
        },
      });
    } catch (error) {
      console.error('Error in banUser:', error.message);
      throw error;
    }
  }

  async unbanUser(
    selfId: number,
    targetId: number,
    channelId: number,
  ): Promise<void> {
    try {
      if (selfId === targetId) {
        throw new HttpException(
          'Current user is the target user.',
          HttpStatus.NOT_FOUND,
        );
      }

      const selfUser = await this.prisma.userChannel.findFirst({
        where: {
          user_id: selfId,
          channel_id: channelId,
        },
      });

      if (!selfUser) {
        throw new HttpException(
          'Current user is not a member of the channel.',
          HttpStatus.NOT_FOUND,
        );
      }

      if (selfUser.role === 'MEMBER') {
        throw new HttpException(
          'Insufficient privileges to unban the user.',
          HttpStatus.FORBIDDEN,
        );
      }

      const channel = await this.prisma.channel.findFirst({
        where: {
          id: channelId,
          banList: {
            some: {
              id: targetId,
            },
          },
        },
        include: {
          banList: true,
        },
      });

      if (!channel) {
        throw new HttpException(
          'User is not currently banned.',
          HttpStatus.BAD_REQUEST,
        );
      }

      const updatedChannel = await this.prisma.channel.update({
        where: {
          id: channelId,
        },
        data: {
          banList: {
            disconnect: {
              id: targetId,
            },
          },
        },
      });
    } catch (error) {
      console.error('Error in unbanUser:', error.message);
      throw error;
    }
  }

  async kickUser(
    selfId: number,
    targetId: number,
    channelId: number,
  ): Promise<void> {
    try {
      if (selfId === targetId) {
        throw new HttpException(
          'Current user is the target user.',
          HttpStatus.NOT_FOUND,
        );
      }

      const selfUser = await this.prisma.userChannel.findFirst({
        where: {
          user_id: selfId,
          channel_id: channelId,
        },
      });

      const targetUser = await this.prisma.userChannel.findFirst({
        where: {
          user_id: targetId,
          channel_id: channelId,
        },
      });

      if (!selfUser) {
        throw new HttpException(
          'Current user is not a member of the channel.',
          HttpStatus.NOT_FOUND,
        );
      }

      if (!targetUser) {
        throw new HttpException(
          'Target user is not a member of the channel.',
          HttpStatus.NOT_FOUND,
        );
      }

      if (
        selfUser.role === 'MEMBER' ||
        (selfUser.role === 'ADMIN' && targetUser.role !== 'MEMBER')
      ) {
        throw new HttpException(
          'Insufficient privileges to kick the user.',
          HttpStatus.FORBIDDEN,
        );
      }

      await this.prisma.userChannel.delete({
        where: {
          id: targetUser.id,
        },
      });
    } catch (error) {
      console.error('Error in kickUser:', error.message);
      throw error;
    }
  }
}
