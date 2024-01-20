import { Module } from '@nestjs/common';
import { FriendslistController } from './friendslist.controller';
import { FriendslistService } from './friendslist.service';


@Module({
  controllers: [FriendslistController],
  providers: [FriendslistService]
})
export class FriendslistModule {}
