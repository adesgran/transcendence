import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Subject, Observable } from 'rxjs';
import { CustomMessageEvent } from './event/message-event.type';
import { Prisma } from '@prisma/client';

@Injectable()
export class MessageService {
  constructor(private readonly prisma: PrismaService) {}

  async channelMessages(channel_id: number) {
    if (!channel_id) {
      console.error(`Channel with ID ${channel_id} not found`);
      throw new NotFoundException(`Channel not found`);
    }

    const messages = await this.prisma.message.findMany({
      where: {
        channel_id,
      },
      include: {
        user: {
          include: {
            friendship_user1: true,
            friendship_user2: true,
          },
        },
      },
      orderBy: {
        created_at: 'asc',
      },
    });

    if (messages === null) {
      console.error(`Messages for channel with ID ${channel_id} not found`);
      throw new NotFoundException('Messages not found for this channel');
    }

    return messages.map((message) => {
      const mergedFriendships = [
        ...message.user.friendship_user1,
        ...message.user.friendship_user2,
      ];
      return {
        ...message,
        user: {
          ...message.user,
          friendships: mergedFriendships,
        },
      };
    });
  }

  async createMessage(channel_id: number, user_id: number, content: string) {
    if (content === '/PongInvitation') {
      const sendedInvitations = await this.prisma.message.count({
        where: {
          user_id,
          content,
          channel: {
            type: 'DM',
          },
        },
      });
      const receivedInvitations = await this.prisma.message.count({
        where: {
          id: channel_id,
          content,
          channel: {
            type: 'DM',
          },
        },
      });
      if (sendedInvitations > 0)
        throw new BadRequestException(`Can't send multiple invitations`);

      if (receivedInvitations > 0)
        throw new BadRequestException(
          `This user has already sent you an invitation`,
        );
    }
    if (!channel_id || !user_id) {
      console.error(
        `Missing property for message creation: channel_id = ${channel_id}, user_id = ${user_id}, content = ${content}`,
      );
      throw new BadRequestException(`Missing property for message creation`);
    }

    if (!content) {
      return undefined;
    }

    try {
      return await this.prisma.message.create({
        data: {
          channel_id,
          user_id,
          content,
        },
      });
    } catch (error) {
      console.error('Error during message creation:', error);
      throw error;
    }
  }

  async deleteReceivedInvitation(id: number, channel_id: number) {
    try {
      const deletedMessages = await this.prisma.message.deleteMany({
        where: {
          channel: {
            id: channel_id,
            type: 'DM',
          },
          content: '/PongInvitation',
          NOT: {
            user_id: id,
          },
        },
      });

      if (deletedMessages) {
        return { success: true, message: 'Invitations deleted successfully' };
      } else {
        throw new NotFoundException('No invitations found');
      }
    } catch (error) {
      console.error('Error deleting invitations:', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error details:', error);
      }

      console.log('No invitations found for deletion');
    }
  }

  async deleteSendedInvitation(id: number) {
    try {
      const deletedMessages = await this.prisma.message.deleteMany({
        where: {
          channel: {
            type: 'DM',
          },
          content: '/PongInvitation',
          user_id: id,
        },
      });

      if (deletedMessages) {
        return { success: true, message: 'Invitations deleted successfully' };
      } else {
        throw new NotFoundException('No invitations found');
      }
    } catch (error) {

      console.error('Error deleting invitations:', error);

      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        console.error('Prisma error details:', error);
      }

      console.log('No invitations found for deletion');
    }
  }

  async getInvitationChannel(user_id: number) {
    const message = await this.prisma.message.findFirst({
      where: {
        user_id,
        content: '/PongInvitation',
      },
    });
    if (!message) {
      console.log('No invitations found for deletion');
      return;
    }
    return message.channel_id;
  }

  private messageEvents = new Subject<any>();

  emitMessage(channel_id: number) {
    this.messageEvents.next({ channel_id });
  }

  getMessageEvents(): Observable<CustomMessageEvent> {
    return this.messageEvents.asObservable();
  }
}
