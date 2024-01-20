import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { ChannelService } from 'src/channel/channel.service';

@Module({
  controllers: [UserController],
  providers: [UserService, ChannelService],
  exports: [UserService],
})
export class UserModule {}
