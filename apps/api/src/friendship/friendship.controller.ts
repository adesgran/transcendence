import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { CurrentUser } from 'src/decorators/user.decorator';

@Controller()
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Get('/friendships')
  async getCurrUserFriendships(@CurrentUser() currUser) {
    return await this.friendshipService.userFriendships(currUser.id);
  }

  @Get('/friendship/:id')
  async getCurrUserFriendship(
    @CurrentUser() currUser,
    @Param('id') targetId: number,
  ) {
    return await this.friendshipService.userFriendship(currUser.id, targetId);
  }

  @Delete('/relationship/friends/:id')
  async deleteFriends(@Param('id') user1_id: number, @CurrentUser() user2) {
    return await this.friendshipService.deleteFriendship(user1_id, user2.id);
  }

  @Delete('/relationship/blocked/:id')
  async deleteBlocked(@Param('id') user1_id: number, @CurrentUser() user2) {
    return await this.friendshipService.deleteBlocked(user1_id, user2.id);
  }

  @Post('/friendship')
  async createCurrUserFriendship(
    @CurrentUser() user1,
    @Body('user2_id') user2_id: number,
  ) {
    return await this.friendshipService.createFriendship(user1.id, user2_id);
  }

  @Post('/block/:id')
  async createBlockedFriendship(
    @Param('id') user2_id: number,
    @CurrentUser() user1,
  ) {
    return await this.friendshipService.createBlockedFriendship(
      user1.id,
      user2_id,
    );
  }

  @Get('/friendships/pendingList')
  async getPendingInvitations(@CurrentUser() currUser) {
    console.log('Pending request list');
    return await this.friendshipService.getPendingInvitations(currUser.id);
  }

  @Get('/friendships/blockedList')
  async getBlockedList(@CurrentUser() currUser) {
    console.log('Pending request list');
    return await this.friendshipService.getBlockedList(currUser.id);
  }
}
