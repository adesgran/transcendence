import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { FriendshipService } from './friendship.service';
import { CurrentUser } from 'src/decorators/user.decorator';

@Controller('friendships')
export class FriendshipController {
  constructor(private readonly friendshipService: FriendshipService) {}

  @Get()
  async getCurrUserFriendships(@CurrentUser() currUser) {
    return await this.friendshipService.userFriendships(currUser.id);
  }

  @Delete('/relationship/friends/:id')
  async deleteFriends(@Param('id') user1_id: number, @CurrentUser() user2) {
    return await this.friendshipService.deleteFriends(user1_id, user2.id);
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
    console.log(user2_id);
    return await this.friendshipService.createFriendship(user1.id, user2_id);
  }

  @Get('/pendingList')
  async getPendingInvitations(@CurrentUser() currUser) {
    console.log('Pending request list');
    return await this.friendshipService.getPendingInvitations(currUser.id);
  }

  @Get('/blockedList')
  async getBlockedList(@CurrentUser() currUser) {
    console.log('Pending request list');
    return await this.friendshipService.getBlockedList(currUser.id);
  }
}
