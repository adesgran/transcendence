import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { UserChannelRoles } from './roles/user-channel.roles';
import { DateTime } from 'luxon';
import { ChanType } from '@prisma/client';
import { FriendshipService } from 'src/friendship/friendship.service';

@Injectable()
export class UserChannelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly friendshipService: FriendshipService,
  ) {}

  private logAndThrowNotFound(id: number, entity: string) {
    console.error(`User with ID ${id} not found`);
    throw new NotFoundException(`${entity} not found`);
  }

  async containBlockedUser(channel_id: number, user_id: number) {
    if (!channel_id) {
      this.logAndThrowNotFound(channel_id, 'Channel');
    }
    if (!user_id) {
      this.logAndThrowNotFound(user_id, 'User');
    }

    const userChannels = await this.prisma.userChannel.findMany({
      where: {
        channel_id,
        user_id: { not: user_id },
      },
      include: {
        User: true,
      },
    });

    if (!userChannels) return false;

    for (const uc of userChannels) {
      if (
        await this.friendshipService.isBlockedRelationship(uc.User.id, user_id)
      ) {
        return true;
      }
    }

    return Promise.all(
      userChannels.map((uc) =>
        this.friendshipService
          .isBlockedRelationship(uc.User.id, user_id)
          .then((r) => {
            if (r) return Promise.reject();
            return Promise.resolve();
          }),
      ),
    )
      .then(() => false)
      .catch(() => true);
  }

  async createUserChannel(params: {
    userId: number;
    channelId: number;
    role: UserChannelRoles;
  }) {
    if (!params.channelId) {
      this.logAndThrowNotFound(params.channelId, 'Channel');
    }
    if (!params.userId) {
      this.logAndThrowNotFound(params.userId, 'User');
    }

    const { userId, channelId, role } = params;

    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
      include: {
        banList: true,
        userChannels: {},
      },
    });

    if (!channel) {
      this.logAndThrowNotFound(channelId, 'Channel');
    }

    if (channel && channel.banList.some((user) => user.id === userId)) {
      throw new ForbiddenException('User is banned in this channel.');
    }

    if (
      channel.type === ChanType.DM &&
      (await this.containBlockedUser(channelId, userId))
    ) {
      throw new ForbiddenException('DM cannot be created');
    }

    return this.prisma.userChannel.create({
      data: {
        User: {
          connect: {
            id: userId,
          },
        },
        Channel: {
          connect: {
            id: channelId,
          },
        },
        role,
      },
    });
  }

  async deleteUserChannel(id: number) {
    if (!id) this.logAndThrowNotFound(id, 'UserChannel');
    return await this.prisma.userChannel.delete({
      where: {
        id,
      },
    });
  }

  async currUser(user_id: number, channel_id: number) {
    if (!channel_id) {
      this.logAndThrowNotFound(channel_id, 'Channel');
    }
    if (!user_id) {
      this.logAndThrowNotFound(user_id, 'User');
    }
    const userChan = await this.prisma.userChannel.findUnique({
      where: {
        user_id_channel_id: {
          user_id,
          channel_id,
        },
      },
      include: {
        User: true,
      },
    });

    if (!userChan) {
      return {};
    }

    const { id, role, User, mute } = userChan;
    const { username, avatar_url } = User;

    const isMuted = mute ? DateTime.fromJSDate(mute) > DateTime.now() : false;

    return {
      id,
      userId: user_id,
      role,
      username,
      avatar_url,
      isMuted,
      mutedUntil: DateTime.fromJSDate(mute).toJSDate(),
    };
  }

  async updateReadUntil(user_id: number, channel_id: number) {
    if (!channel_id || channel_id <= 0) {
      this.logAndThrowNotFound(channel_id, 'Channel');
    }
    if (!user_id) {
      this.logAndThrowNotFound(user_id, 'User');
    }
    return await this.prisma.userChannel.update({
      where: {
        user_id_channel_id: {
          user_id,
          channel_id,
        },
      },
      data: {
        read_until: new Date(),
      },
    });
  }
}
