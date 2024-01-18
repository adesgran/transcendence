import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { UserChannelService } from './user-channel.service';
import { CurrentUser, CurrentUserID } from 'src/decorators/user.decorator';
import { UserChannelRoles } from './roles/user-channel.roles';
import { UserChannelModerateService } from './user-channel.moderate.service';
import { UserService } from 'src/user/user.service';
import { UserEventType } from 'src/user/types/user-event.types';
import { ChannelService } from 'src/channel/channel.service';

@Controller()
export class UserChannelController {
  constructor(
    private readonly userChannelService: UserChannelService,
    private readonly userChannelModerateService: UserChannelModerateService,
    private readonly userService: UserService,
    private readonly channelService: ChannelService,
  ) {}

  @Post('/user-channel')
  async addCurrUser(@Body('channelId') channelId, @CurrentUser() user) {
    const userChannel = await this.userChannelService.createUserChannel({
      userId: user.id,
      channelId: channelId,
      role: UserChannelRoles.MEMBER,
    });

    const memberIds = (
      await this.channelService.getChannelMemberIds(channelId)
    ).filter((i) => i !== user.id);

    this.userService.emitUserEvent(
      UserEventType.ADDEDTOCHAN,
      memberIds,
      user.id,
      channelId,
    );

    return userChannel;
  }

  @Post('/user-channel/:userid')
  async addUser(
    @Body('channelId') channelId,
    @Param('userid') userId: number,
    @CurrentUserID() currUserId: number,
  ) {
    const userChannel = await this.userChannelService.createUserChannel({
      userId: userId,
      channelId: channelId,
      role: UserChannelRoles.MEMBER,
    });

    const memberIds = (
      await this.channelService.getChannelMemberIds(channelId)
    ).filter((i) => i !== currUserId);

    this.userService.emitUserEvent(
      UserEventType.ADDEDTOCHAN,
      memberIds,
      currUserId,
      channelId,
    );

    return userChannel;
  }

  @Delete('/user-channel/:id')
  async delete(@Param('id') id: number) {
    const deletedUserChannel =
      await this.userChannelService.deleteUserChannel(id);

    const memberIds = (
      await this.channelService.getChannelMemberIds(
        deletedUserChannel.channel_id,
      )
    ).filter((i) => i !== deletedUserChannel.user_id);

    this.userService.emitUserEvent(
      UserEventType.DEPARTUREFROMCHAN,
      memberIds,
      deletedUserChannel.user_id,
      deletedUserChannel.channel_id,
    );

    return deletedUserChannel;
  }

  @Get('/user-channel/:channelid/current-user')
  async findCurrUser(
    @CurrentUser() user,
    @Param('channelid') channelId: number,
  ) {
    if (!channelId) return { id: user.id, role: undefined };
    return await this.userChannelService.currUser(user.id, channelId);
  }

  @Get('/user-channel/:channelid/:userid')
  async findUser(
    @Param('channelid') channelId: number,
    @Param('userid') targetId: number,
  ) {
    if (!channelId || !targetId)
      return {
        /* HTTP STATUS */
      };
    return await this.userChannelService.currUser(targetId, channelId);
  }

  @Post('/user-channel/moderate/admin')
  async makeAdmin(
    @Body() body: { data: { targetId: number; channelId: number } },
    @CurrentUserID() selfId: number,
  ) {
    const { targetId, channelId } = body.data;
    const result = await this.userChannelModerateService.makeAdmin(
      selfId,
      targetId,
      channelId,
    );

    const memberIds = (
      await this.channelService.getChannelMemberIds(channelId)
    ).filter((i) => i !== selfId);

    this.userService.emitUserEvent(
      UserEventType.ADMINMADE,
      memberIds,
      selfId,
      channelId,
    );

    return result;
  }

  @Patch('/user-channel/moderate/admin')
  async demoteAdmin(
    @Body() body: { data: { targetId: number; channelId: number } },
    @CurrentUserID() selfId: number,
  ) {
    try {
      const { data } = body;

      if (!data || !data.targetId || !data.channelId) {
        throw new HttpException('Invalid request body', HttpStatus.BAD_REQUEST);
      }

      const { targetId, channelId } = data;
      const result = await this.userChannelModerateService.demoteAdmin(
        selfId,
        targetId,
        channelId,
      );

      const memberIds = (
        await this.channelService.getChannelMemberIds(channelId)
      ).filter((i) => i !== selfId);

      this.userService.emitUserEvent(
        UserEventType.DEMOTEADMIN,
        memberIds,
        selfId,
        channelId,
      );

      return result;
    } catch (error) {
      console.error('Error in demoteAdmin:', error.message);
      throw error;
    }
  }

  @Post('/user-channel/moderate/owner')
  async makeOwner(
    @Body() body: { data: { targetId: number; channelId: number } },
    @CurrentUserID() selfId: number,
  ) {
    const { targetId, channelId } = body.data;
    const result = await this.userChannelModerateService.makeOwner(
      selfId,
      targetId,
      channelId,
    );

    const memberIds = (
      await this.channelService.getChannelMemberIds(channelId)
    ).filter((i) => i !== selfId);

    this.userService.emitUserEvent(
      UserEventType.OWNERMADE,
      memberIds,
      selfId,
      channelId,
    );

    return result;
  }

  @Post('/user-channel/moderate/mute')
  async muteUser(
    @Body()
    body: { data: { targetId: number; channelId: number; endDate: Date } },
    @CurrentUserID() selfId: number,
  ) {
    try {
      const { data } = body;

      if (!data || !data.targetId || !data.channelId || !data.endDate) {
        throw new HttpException('Invalid request body', HttpStatus.BAD_REQUEST);
      }

      const muteUser = await this.userChannelModerateService.muteUser(
        selfId,
        data.targetId,
        data.channelId,
        data.endDate,
      );

      const memberIds = (
        await this.channelService.getChannelMemberIds(data.channelId)
      ).filter((i) => i !== selfId);

      this.userService.emitUserEvent(
        UserEventType.MUTEINCHAN,
        memberIds,
        selfId,
        data.channelId,
      );

      return muteUser;
    } catch (error) {
      console.error('Error in muteUser:', error.message);
      throw error;
    }
  }

  @Patch('/user-channel/moderate/unmute')
  async unmuteUser(
    @Body() body: { data: { targetId: number; channelId: number } },
    @CurrentUserID() selfId: number,
  ) {
    try {
      const { data } = body;

      if (!data || !data.targetId || !data.channelId) {
        throw new HttpException('Invalid request body', HttpStatus.BAD_REQUEST);
      }

      const unmuteUser = await this.userChannelModerateService.unmuteUser(
        selfId,
        data.targetId,
        data.channelId,
      );

      const memberIds = (
        await this.channelService.getChannelMemberIds(data.channelId)
      ).filter((i) => i !== selfId);

      this.userService.emitUserEvent(
        UserEventType.UNMUTEINCHAN,
        memberIds,
        selfId,
        data.channelId,
      );

      return unmuteUser;
    } catch (error) {
      console.error('Error in unmuteUser:', error.message);
      throw error;
    }
  }

  @Post('/user-channel/moderate/ban')
  async banUser(
    @Body()
    body: { data: { targetId: number; channelId: number } },
    @CurrentUserID() selfId: number,
  ) {
    try {
      const { data } = body;

      if (!data || !data.targetId || !data.channelId) {
        throw new HttpException('Invalid request body', HttpStatus.BAD_REQUEST);
      }

      const memberIds = (
        await this.channelService.getChannelMemberIds(data.channelId)
      ).filter((i) => i !== selfId);

      const banUser = await this.userChannelModerateService.banUser(
        selfId,
        data.targetId,
        data.channelId,
      );

      this.userService.emitUserEvent(
        UserEventType.BANFROMCHAN,
        memberIds,
        selfId,
        data.channelId,
      );

      return banUser;
    } catch (error) {
      console.error('Error in banUser:', error.message);
      throw error;
    }
  }

  @Patch('/user-channel/moderate/unban')
  async unbanUser(
    @Body() body: { data: { targetId: number; channelId: number } },
    @CurrentUserID() selfId: number,
  ) {
    try {
      const { data } = body;

      if (!data || !data.targetId || !data.channelId) {
        throw new HttpException('Invalid request body', HttpStatus.BAD_REQUEST);
      }

      const unbanUser = await this.userChannelModerateService.unbanUser(
        selfId,
        data.targetId,
        data.channelId,
      );

      const memberIds = (
        await this.channelService.getChannelMemberIds(data.channelId)
      ).filter((i) => i !== selfId);

      this.userService.emitUserEvent(
        UserEventType.UNBANFROMCHAN,
        [...memberIds, data.targetId],
        selfId,
        data.channelId,
      );

      return unbanUser;
    } catch (error) {
      console.error('Error in unbanUser:', error.message);
      throw error;
    }
  }

  @Post('/user-channel/moderate/kick')
  async kickUser(
    @Body() body: { data: { targetId: number; channelId: number } },
    @CurrentUserID() selfId: number,
  ) {
    try {
      const { data } = body;

      if (!data || !data.targetId || !data.channelId) {
        throw new HttpException('Invalid request body', HttpStatus.BAD_REQUEST);
      }

      const memberIds = (
        await this.channelService.getChannelMemberIds(data.channelId)
      ).filter((i) => i !== selfId);

      const kickUser = await this.userChannelModerateService.kickUser(
        selfId,
        data.targetId,
        data.channelId,
      );

      this.userService.emitUserEvent(
        UserEventType.KICKFROMCHAN,
        memberIds,
        selfId,
        data.channelId,
      );

      return kickUser;
    } catch (error) {
      console.error('Error in kickUser:', error.message);
      throw error;
    }
  }

  @Patch('/user-channel/:channelid/readuntil')
  async updateReadUntil(
    @CurrentUserID() user_id,
    @Param('channelid') channel_id: number,
  ) {
    return await this.userChannelService.updateReadUntil(user_id, channel_id);
  }
}
