import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { GameModule } from './game/game.module';
import { AuthModule } from './auth/auth.module';
import { ChannelModule } from './database/channel/channel.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'front', 'dist'),
    }),
    DatabaseModule,
    GameModule,
    AuthModule,
    ChannelModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}