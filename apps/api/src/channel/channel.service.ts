import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateChannelDto } from './dto/create-channel.dto';

@Injectable()
export class ChannelService {
  constructor(private readonly prisma: PrismaService) {}

  async createChannel(createChannelDto: CreateChannelDto) {
    return this.prisma.channel.create({
      data: {
        ...createChannelDto,
      },
    });
  }

  async channelsCurrentUser(params: { currUserId: number }) {
    const { currUserId } = params;
    return (
      await this.prisma.channel.findMany({
        where: {
          userChannels: {
            some: {
              user_id: currUserId,
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
      })
    ).map((el) => ({
      ...el,
      image: el.userChannels.find((uc) => uc.User?.id !== currUserId)?.User
        .avatar_url,
      interlocutor: el.userChannels.find((uc) => uc.User?.id !== currUserId)
        ?.User.username,
    }));
  }

  async otherChannels(params: { currUserId: number }) {
    const { currUserId } = params;
    return await this.prisma.channel.findMany({
      where: {
        type: { in: ['PUBLIC', 'PROTECTED'] },
        userChannels: {
          none: {
            user_id: currUserId,
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
  }
}
