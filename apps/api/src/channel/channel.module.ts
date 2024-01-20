import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { PrismaService } from '../prisma.service';
import { UserChannelService } from 'src/user-channel/user-channel.service';
import { MessageService } from 'src/message/message.service';
import { FriendshipService } from 'src/friendship/friendship.service';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [ChannelController],
  providers: [
    ChannelService,
    UserChannelService,
    MessageService,
    FriendshipService,
  ],
  imports: [UserModule],
})
export class ChannelModule {}
