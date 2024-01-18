import {
  Body,
  Controller,
  Delete,
  Get,
  MessageEvent,
  Param,
  Post,
  Sse,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CurrentUserID } from 'src/decorators/user.decorator';
import { Observable, interval, merge, from } from 'rxjs';
import { map, filter, mergeMap } from 'rxjs/operators';
import { ChannelService } from 'src/channel/channel.service';

@Controller()
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly channelService: ChannelService,
  ) {}

  @Get('/messages/:channelid')
  async findChannelMessages(@Param('channelid') channel_id: number) {
    return await this.messageService.channelMessages(channel_id);
  }

  @Post('/message')
  async createMessage(
    @Body('channel_id') channel_id: number,
    @Body('message') content: string,
    @CurrentUserID() user_id: number,
  ) {
    const message = await this.messageService.createMessage(
      channel_id,
      user_id,
      content,
    );
    this.messageService.emitMessage(channel_id);
    return message;
  }

  @Sse('/stream/messages')
  streamMessages(@CurrentUserID() user_id: number): Observable<MessageEvent> {
    const heartbeat = interval(30000).pipe(map(() => ({ data: '' })));

    const message = this.messageService.getMessageEvents().pipe(
      mergeMap((event) =>
        from(this.channelService.isUserMember(event.channel_id, user_id)).pipe(
          filter((isMember) => isMember),
          map(() => ({
            type: 'message',
            data: JSON.stringify({
              channelId: event.channel_id,
            }),
          })),
        ),
      ),
    );
    return merge(heartbeat, message);
  }

  @Delete('/message/receivedinvitation/:channel_id')
  async deleteReceivedInvitation(
    @Param('channel_id') channel_id: number,
    @CurrentUserID() user_id: number,
  ) {
    this.messageService.emitMessage(channel_id);
    return this.messageService.deleteReceivedInvitation(user_id, channel_id);
  }

  @Delete('/message/sendedinvitation')
  async deleteSendedInvitation(@CurrentUserID() user_id: number) {
    const channel_id = await this.messageService.getInvitationChannel(user_id);
    this.messageService.emitMessage(channel_id);
    return this.messageService.deleteSendedInvitation(user_id);
  }
}
