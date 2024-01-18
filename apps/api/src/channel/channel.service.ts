import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { ChanType, FriendshipStatus } from '@prisma/client';
import { UserChannelRoles } from 'src/user-channel/roles/user-channel.roles';
import * as bcrypt from 'bcrypt';
import { ChannelTypes } from './types/channel.types';

@Injectable()
export class ChannelService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createChannel(
    channelData: Omit<CreateChannelDto, 'passwordConfirmation'>,
  ) {
    try {
      { }
      const { password, ...channelDataOther } = channelData;
      let hash = password;
      if (channelData.type === ChannelTypes.PROTECTED) {
        hash = await this.hashPassword(channelData.password);
      }
  
      return this.prisma.channel.create({
        data: {
          ...channelDataOther,
          password: hash,
        },
      });
    } catch (error) {
      console.error('Error during channel creation:', error);
      throw error;
    }
  }

  async channelsCurrentUser(params: { currUserId: number }) {
    const { currUserId } = params;

    if (!currUserId) {
      console.error(`User with ID ${currUserId} not defined`);
      throw new NotFoundException(`User not found`);
    }

    const blockedUserIds = await this.prisma.friendship.findMany({
      where: {
        OR: [
          { user1_id: currUserId, status: 'BLOCKED' },
          { user2_id: currUserId, status: 'BLOCKED' },
        ],
      },
      select: {
        user1_id: true,
        user2_id: true,
      },
    });

    const blockedIds = blockedUserIds
      .flatMap((u) => [u.user1_id, u.user2_id])
      .filter((id) => id !== currUserId);

    const userChannels = await this.prisma.channel.findMany({
      where: {
        userChannels: {
          some: {
            user_id: currUserId,
          },
        },
        NOT: {
          AND: [
            {
              type: ChanType.DM,
            },
            {
              userChannels: {
                some: {
                  user_id: {
                    in: blockedIds,
                  },
                },
              },
            },
          ],
        },
      },
      include: {
        userChannels: {
          include: {
            User: true,
          },
        },
        messages: {
          orderBy: {
            created_at: 'desc',
          },
        },
      },
    });

    if (userChannels === null) {
      console.error(`Channels for User with ID ${currUserId} not found`);
      throw new NotFoundException('Channels not found');
    }

    const sortedChannels = userChannels
      .map((el) => ({
        ...el,
        interlocutor: el.userChannels.find((uc) => uc.User?.id !== currUserId)
          ?.User,
        myUserChannel: el.userChannels.find((uc) => uc.User?.id === currUserId),
      }))
      .map((el) => ({
        ...el,
        notif: el.messages.filter(
          (m) =>
            m.user_id !== currUserId &&
            m.created_at.getTime() >
              (el.myUserChannel?.read_until.getTime() ?? 0),
        ).length,
      }))
      .sort((a, b) => {
        const dateA = Math.max(
          a.myUserChannel?.created_at.getTime() ?? 0,
          a.messages[0]?.created_at.getTime() ?? 0,
        );
        const dateB = Math.max(
          b.myUserChannel?.created_at.getTime() ?? 0,
          b.messages[0]?.created_at.getTime() ?? 0,
        );
        return dateB - dateA;
      });

    return sortedChannels;
  }

  async chat(user_id: number, channel_id: number) {
    if (!user_id || !channel_id) {
      console.error(
        `Error with params Channel ID ${channel_id} and User ID ${user_id}`,
      );
      throw new BadRequestException(`Channel ID or User ID is missing`);
    }

    const chat = await this.prisma.channel.findFirst({
      where: {
        userChannels: {
          some: {
            user_id,
            channel_id,
          },
        },
      },
      include: {
        userChannels: {
          include: {
            User: true,
          },
        },
      },
    });

    if (chat === null) {
      console.error(
        `UserChannel with Channel ID ${channel_id} and User ID ${user_id} not found`,
      );
      throw new NotFoundException('Channel not found');
    }

    return {
      ...chat,
      interlocutor: chat.userChannels?.find((uc) => uc.User?.id !== user_id)
        ?.User,
    };
  }

  async getCommonChats(user1_id: number, user2_id: number) {
    if (!user1_id || !user2_id) {
      console.error(
        `Error with params User1 ID ${user1_id} and User2 ID ${user2_id}`,
      );
      throw new BadRequestException(`User1 ID or User2 ID is missing`);
    }

    const channels = await this.prisma.channel.findMany({
      where: {
        AND: [
          {
            userChannels: {
              some: {
                user_id: user1_id,
              },
            },
          },
          {
            userChannels: {
              some: {
                user_id: user2_id,
              },
            },
          },
        ],
        type: { not: ChanType.DM },
      },
      select: {
        id: true,
      },
    });

    if (channels === null) {
      console.error(
        `Common channels between User ${user1_id} and User ${user2_id} not found`,
      );
      throw new NotFoundException('Common channel not found');
    }

    return channels;
  }

  async getExcludedChats(user1_id: number, user2_id: number) {
    if (!user1_id || !user2_id) {
      console.error(
        `Error with params User1 ID ${user1_id} and User2 ID ${user2_id}`,
      );
      throw new BadRequestException(`User1 ID or User2 ID is missing`);
    }

    const channels = await this.prisma.channel.findMany({
      where: {
        AND: [
          {
            userChannels: {
              some: {
                user_id: user1_id,
              },
            },
          },
          {
            userChannels: {
              none: {
                user_id: user2_id,
              },
            },
          },
        ],
        type: { not: ChanType.DM },
      },
      select: {
        id: true,
      },
    });

    if (channels === null) {
      console.error(
        `Not common channels between User ${user1_id} and User ${user2_id} not found`,
      );
      throw new NotFoundException('Not common channel not found');
    }

    return channels;
  }

  async otherChannels(params: { currUserId: number }) {
    const { currUserId } = params;

    if (!currUserId) {
      console.error(`User with ID ${currUserId} not defined`);
      throw new NotFoundException(`User not found`);
    }

    const channels = await this.prisma.channel.findMany({
      where: {
        type: { in: ['PUBLIC', 'PROTECTED'] },
        userChannels: {
          none: {
            user_id: currUserId,
          },
        },
        banList: {
          none: {
            id: currUserId,
          },
        },
      },
      include: {
        userChannels: {
          include: {
            User: true,
          },
        },
      },
    });

    if (channels === null) {
      console.error(`Channels without User ${currUserId} not found`);
      throw new NotFoundException('Other channels not found');
    }

    return channels;
  }

  async channel(id: number) {
    if (!id) {
      console.error(`Channel ID ${id} not defined`);
      throw new NotFoundException(`Channel not found`);
    }

    const channel = await this.prisma.channel.findUnique({
      where: {
        id,
      },
      include: {
        userChannels: {
          include: {
            User: true,
          },
          orderBy: [
            {
              role: 'desc',
            },
            {
              User: {
                username: 'asc',
              },
            },
          ],
        },
      },
    });

    if (channel === null) {
      console.error(`Channel with ID ${id} not found`);
      throw new NotFoundException(`Channel not found`);
    }

    return channel;
  }

  async isUserMember(channelId: number, userId: number) {
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
        userChannels: {
          some: {
            user_id: userId,
          },
        },
      },
    });
    return channel !== null;
  }

  async getNonMembers(channel_id: number, user_id: number) {
    if (!channel_id || !user_id) {
      console.error(
        `Error with params User ID ${user_id} and Channel ID ${channel_id}`,
      );
      throw new BadRequestException(`User ID or Channel ID is missing`);
    }

    const users = await this.prisma.user.findMany({
      where: {
        isDeleted: false,
        userChannels: {
          none: {
            channel_id,
          },
        },
        bannedChannels: {
          none: {
            id: channel_id,
          },
        },
        friendship_user1: {
          none: {
            user2_id: user_id,
            status: FriendshipStatus.BLOCKED,
          },
        },
        friendship_user2: {
          none: {
            user1_id: user_id,
            status: FriendshipStatus.BLOCKED,
          },
        },
      },
    });

    if (users === null) {
      console.error(
        `User non members of Channel with ID ${channel_id} not found`,
      );
      throw new NotFoundException(`User not found`);
    }

    return users;
  }

  async updateChannel(
    id: number,
    channelData: Omit<CreateChannelDto, 'passwordConfirmation'>,
  ) {
    try {
      const { password, ...channelDataOther } = channelData;
      let hash = password;
      if (channelData.type === ChannelTypes.PROTECTED) {
      const hash = await this.hashPassword(channelData.password);
      }
      return await this.prisma.channel.update({
        where: {
          id,
        },
        data: {
          ...channelData,
          password: hash,
        },
      });
    } catch (error) {
      console.error('Error during channel update:', error);
      throw error;
    }
  }

  async getBanList(
    user_id: number,
    channel_id: number,
  ): Promise<{ id: number; username: string }[]> {
    try {
      const userChannel = await this.prisma.userChannel.findFirst({
        where: {
          user_id,
          channel_id,
          role: {
            in: ['OWNER', 'ADMIN'],
          },
        },
      });

      if (!userChannel) {
        throw new HttpException(
          'User does not have sufficient privileges in the channel.',
          HttpStatus.FORBIDDEN,
        );
      }

      const channel = await this.prisma.channel.findUnique({
        where: {
          id: channel_id,
        },
        include: {
          banList: {
            select: {
              id: true,
              username: true,
            },
          },
        },
      });

      if (!channel) {
        throw new HttpException('Channel not found.', HttpStatus.NOT_FOUND);
      }

      return channel.banList.map((user) => ({
        id: user.id,
        username: user.username,
      }));
    } catch (error) {
      console.error('Error in getBanList:', error.message);
      throw error;
    }
  }

  async getDm(user1_id: number, user2_id: number) {
    if (!user1_id || !user2_id) {
      console.error(
        `Error with params User1 ID ${user1_id} and User2 ID ${user2_id}`,
      );
      throw new BadRequestException(`User1 ID or User2 ID is missing`);
    }

    const user1Channels = await this.prisma.channel.findMany({
      where: {
        type: ChanType.DM,
        userChannels: {
          some: {
            user_id: user1_id,
          },
        },
      },
    });

    const user2Channels = await this.prisma.channel.findMany({
      where: {
        type: ChanType.DM,
        userChannels: {
          some: {
            user_id: user2_id,
          },
        },
      },
    });

    const dm = user1Channels.find((channel1) =>
      user2Channels.some((channel2) => channel2.id === channel1.id),
    );

    if (dm === null) {
      console.error(`DM of User ${user1_id} and ${user2_id} not found`);
      throw new NotFoundException(`DM not found`);
    }

    return dm;
  }

  async checkPwd(channelId: number, password: string) {
    if (!channelId || !password) {
      console.error(`Error with params Channel ID ${channelId} and Password`);
      throw new BadRequestException(`Channel ID or Passsword is missing`);
    }
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });
    if (channel === null) return false;
    return this.comparePassword(password, channel.password);
  }

  async deleteChannel(userId: number, channelId: number) {
    if (!channelId || !userId) {
      console.error(
        `Error with params Channel ID ${channelId} and User ID ${userId}`,
      );
      throw new BadRequestException(`Channel ID or User ID is missing`);
    }
    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
      include: {
        userChannels: {
          where: {
            user_id: userId,
            role: 'OWNER',
          },
        },
      },
    });

    if (!channel || channel.userChannels.length === 0) {
      throw new ForbiddenException(
        `User with ID ${userId} is not the owner of the channel`,
      );
    }

    const deletedChannel = await this.prisma.channel.delete({
      where: {
        id: channelId,
      },
    });

    return deletedChannel;
  }

  async getChannelMemberIds(channel_id: number) {
    const members = await this.prisma.user.findMany({
      where: {
        userChannels: {
          some: {
            channel_id,
          },
        },
      },
    });

    if (members === null) {
      console.error(`No members for Channel ID ${channel_id}`);
      return [];
    }
    const memberIds = members.map((m) => m.id);

    return memberIds;
  }

  async deleteChannelOwner(id: number) {
    const channel_ids = (
      await this.prisma.userChannel.findMany({
        where: {
          user_id: id,
          role: UserChannelRoles.OWNER,
        },
      })
    ).map((c) => c.channel_id);

    try {
      return this.prisma.channel.deleteMany({
        where: {
          id: {
            in: channel_ids,
          },
        },
      });
    } catch (error) {
      console.error(`Error while deleting channel owned by User ${id}`, error);
      throw error;
    }
  }

  async dmAlreadyExists(user1_id: number, user2_id: number) {
    if (!user1_id || !user2_id) {
      console.error(
        `Error with params User1 ID ${user1_id} and User2 ID ${user2_id}`,
      );
      throw new BadRequestException(`User1 ID or User2 ID is missing`);
    }
    const user1Channels = await this.prisma.channel.findMany({
      where: {
        type: ChanType.DM,
        userChannels: {
          some: {
            user_id: user1_id,
          },
        },
      },
    });

    const user2Channels = await this.prisma.channel.findMany({
      where: {
        type: ChanType.DM,
        userChannels: {
          some: {
            user_id: user2_id,
          },
        },
      },
    });

    const dm = user1Channels.find((channel1) =>
      user2Channels.some((channel2) => channel2.id === channel1.id),
    );

    return dm !== undefined ? dm.id : undefined;
  }

  async hashPassword(password: string){
		try {
			const salt = await bcrypt.genSalt();;
			const hash = await bcrypt.hash(password, salt);
			return hash;
		} catch (err) {
			const err_message = "Failed to hash password";
			console.log("500 EXCEPTION THROWN: ", err_message);
			throw new InternalServerErrorException(err_message);
		}
	}

	async comparePassword(password:string, hash:string){
		try {
			return await bcrypt.compare(password, hash)
		} catch (err) {
			const err_message = "Failed in hashed password comparison";
			console.log("500 EXCEPTION THROWN: ", err_message);
			throw new InternalServerErrorException(err_message);
		}
	}

}
