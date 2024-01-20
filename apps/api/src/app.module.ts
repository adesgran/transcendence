import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './channel/channel.module';
import { PrismaService } from './prisma.service';
import { UserChannelModule } from './user-channel/user-channel.module';
import { ProfileModule } from './profile/profile.module';
import { LadderModule } from './ladder/ladder.module';
import { AchievementsModule } from './achievements/achievements.module';
import { FriendslistModule } from './friendslist/friendslist.module';
import { FriendshipModule } from './friendship/friendship.module';
import { PongGateway } from './game/pong.gateway';
import { UserModule } from './user/user.module';
import { MessageModule } from './message/message.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'front', 'dist'),
    }),
    GameModule,
    AuthModule,
    ChannelModule,
    UserChannelModule,
    ProfileModule,
    LadderModule,
    AchievementsModule,
    FriendslistModule,
    FriendshipModule,
    UserModule,
    MessageModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
