import { Module } from '@nestjs/common';
import { UserChannelController } from './user-channel.controller';
import { UserChannelService } from './user-channel.service';
import { UserChannelModerateService } from './user-channel.moderate.service';
import { FriendshipService } from 'src/friendship/friendship.service';
import { MessageService } from 'src/message/message.service';
import { UserModule } from 'src/user/user.module';
import { ChannelService } from 'src/channel/channel.service';

@Module({
  controllers: [UserChannelController],
  providers: [
    UserChannelService,
    UserChannelModerateService,
    FriendshipService,
    MessageService,
    ChannelService,
  ],
  imports: [UserModule],
})
export class UserChannelModule {}
