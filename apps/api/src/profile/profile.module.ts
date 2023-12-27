import { Module } from '@nestjs/common';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';
import { PrismaService } from '../prisma.service';
import { LadderService } from 'src/ladder/ladder.service';
import { FriendshipService } from 'src/friendship/friendship.service';

@Module({
  controllers: [ProfileController],
  providers: [ProfileService, PrismaService, LadderService, FriendshipService],
})
export class ProfileModule {}
