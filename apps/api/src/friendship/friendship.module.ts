import { Module } from '@nestjs/common';
import { FriendshipController } from './friendship.controller';
import { FriendshipService } from './friendship.service';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [FriendshipController],
  providers: [FriendshipService],
  imports: [UserModule],
})
export class FriendshipModule {}
