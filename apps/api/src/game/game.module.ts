import { Module } from '@nestjs/common';
import { PongGateway } from './pong.gateway';
import { lobbyManager } from './lobby/lobbyManager';
import { JwtService } from '@nestjs/jwt';
import { WsGuard } from './ws.guard';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { AchievementsService } from 'src/achievements/achievements.service';

@Module({
  providers: [
    // Gateways
    PongGateway,

    // Managers
    lobbyManager,

    // Auth
    JwtService,
    WsGuard,
    AuthService,
    UserService,
    AchievementsService,
  ],
})
export class GameModule {}
