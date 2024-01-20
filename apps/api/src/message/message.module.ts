import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { ChannelService } from 'src/channel/channel.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService, ChannelService],
})
export class MessageModule {}
