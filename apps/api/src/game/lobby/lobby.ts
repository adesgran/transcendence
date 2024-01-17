import { v4 as uuidv4 } from 'uuid';
import { LobbyCustom } from '../types';
import { PrismaService } from 'src/prisma.service';
import { gameInfo } from '../dto-interface/shared/gameInfo.interface';
import { normalGameInfo } from '../dto-interface/shared/normalGameInfo';
import { clientInfo } from '../dto-interface/clientInfo.interface';
import { AchievementsService } from 'src/achievements/achievements.service';

export class lobby {
  isEmpty(): boolean {
    if (this.clients.length == 0) return true;
    return false;
  }
  private finish = 0;
  ballWallRedir() {
    if (
      this.gameInfo.bally + this.gameInfo.ballSize + this.gameInfo.ballSpeed >=
      this.gameInfo.gameysize
    )
      this.gameInfo.ballDiry *= -1;
    if (this.gameInfo.bally - this.gameInfo.ballSpeed <= 0)
      this.gameInfo.ballDiry *= -1;
  }
  onDisconnect(user: clientInfo) {
    this.finish = 1;
    if (this.clients[0] == user) {
      this.win(this.clients[1], this.clients[0]);
    }
    if (this.clients[1] == user) {
      this.win(this.clients[0], this.clients[1]);
    }
  }
  getPlayer() {
    return this.clients;
  }
  disconnectAll() {
    this.clients.splice(0);
  }

  async win(winner: clientInfo, loser: clientInfo) {
    console.log('test 1');
    try {
      if (winner.socket.connected) winner.socket.emit('server.win', {winner: winner.user.username});

      if (this.isCustom == 'normal') {
        const winnerUser = await this.prisma.user.findUnique({
          where: { username: winner.user.username },
        });

        const loserUser = await this.prisma.user.findUnique({
          where: { username: loser.user.username },
        });

        if (!winnerUser || !loserUser) {
          console.error('User not found');
          return;
        }
        if (winnerUser.id === loserUser.id) {
          return;
        }
        const gameMode =
          winner.mode === 'normal'
            ? 'NORMAL'
            : winner.mode === 'custom'
              ? 'CUSTOM'
              : 'PRIVATE';
        const match = await this.prisma.match.create({
          data: {
            on_going: false,
            type: gameMode,
            players: {
              createMany: {
                data: [
                  {
                    user_id: winnerUser.id,
                    score:
                    this.gameInfo.oneScore > this.gameInfo.twoScore
                      ? this.gameInfo.oneScore
                      : this.gameInfo.twoScore,
                    winner: true,
                  },
                  {
                    user_id: loserUser.id,
                    score:
                    this.gameInfo.oneScore > this.gameInfo.twoScore
                      ? this.gameInfo.twoScore
                      : this.gameInfo.oneScore,
                    winner: false,
                  },
                ],
              },
            },
          },
        });
        this.achievements.updateAchievements(winnerUser.id);
        this.achievements.updateAchievements(loserUser.id);

      return match;
      }
    } catch (error) {
      console.error('Error in win function:', error);
      throw error;
    }
  }

  lose(user: clientInfo) {
    if (user.socket.connected) user.socket.emit('server.lose');
  }

  score() {
    if (
      this.gameInfo.ballx + this.gameInfo.ballSize >=
      this.gameInfo.gamexsize - 10
    ) {
      this.gameInfo.oneScore++;
      this.gameInfo.ballx = this.gameInfo.gamexsize / 2 + this.gameInfo.ballDeb;
      this.gameInfo.bally = this.gameInfo.gameysize / 2;
      this.gameInfo.ballDirx = -1;
      this.gameInfo.ballDiry = 1;
    }
    if (this.gameInfo.ballx <= 10) {
      this.gameInfo.twoScore++;
      this.gameInfo.ballx = this.gameInfo.gamexsize / 2 - this.gameInfo.ballDeb;
      this.gameInfo.bally = this.gameInfo.gameysize / 2;
      this.gameInfo.ballDirx = 1;
      this.gameInfo.ballDiry = 1;
    }
  }

  redirection(
    ratio: number,
    delta: { x: number; y: number },
  ): [number, number] {
    ratio = (ratio - 0.5) * 2;
    const speed = Math.sqrt(delta.x * delta.x + delta.y * delta.y);
    const inAlpha = Math.asin(delta.y / speed);
    let outAlpha = inAlpha + (ratio * Math.PI) / 6;
    const absinAlpha = inAlpha > 0 ? inAlpha : 2 * Math.PI + inAlpha;
    let absoutAlpha = outAlpha > 0 ? outAlpha : 2 * Math.PI + outAlpha;
    if (absinAlpha > Math.PI / 2 && absinAlpha < (3 * Math.PI) / 2) {
      if (absoutAlpha < Math.PI / 2 + Math.PI / 5)
        absoutAlpha = Math.PI / 2 + Math.PI / 5;
      else if (absoutAlpha > (3 * Math.PI) / 2 - Math.PI / 5)
        absoutAlpha = (3 * Math.PI) / 2 - Math.PI / 5;
    } else {
      if (absoutAlpha > Math.PI / 2 - Math.PI / 5 && absoutAlpha < Math.PI)
        absoutAlpha = Math.PI / 2 - Math.PI / 5;
      else if (
        absoutAlpha < (3 * Math.PI) / 2 + Math.PI / 5 &&
        absoutAlpha > Math.PI
      )
        absoutAlpha = (3 * Math.PI) / 2 + Math.PI / 5;
    }
    outAlpha = absoutAlpha > 180 ? absoutAlpha - 2 * Math.PI : absoutAlpha;
    return [1 * speed * Math.cos(outAlpha), speed * Math.sin(outAlpha)];
  }

  ballBarRedir() {
    if (
      this.gameInfo.ballx <= this.gameInfo.barLarge + this.gameInfo.barDist &&
      this.gameInfo.ballx >= this.gameInfo.barDist
    ) {
      let temp = 0;
      while (temp < this.gameInfo.ballSize) {
        if (
          this.gameInfo.bally + temp <=
            this.gameInfo.oneBary + this.gameInfo.barSize &&
          this.gameInfo.bally + temp >= this.gameInfo.oneBary
        ) {
          const ret =
            (this.gameInfo.bally - this.gameInfo.oneBary) /
            this.gameInfo.barSize;
          [this.gameInfo.ballDirx, this.gameInfo.ballDiry] = this.redirection(
            ret,
            {
              x: this.gameInfo.ballDirx,
              y: this.gameInfo.ballDiry,
            },
          );
          return;
        }
        temp++;
      }
    }
    if (
      this.gameInfo.ballx + this.gameInfo.ballSize >=
        this.gameInfo.gamexsize -
          this.gameInfo.barLarge -
          this.gameInfo.barDist &&
      this.gameInfo.ballx + this.gameInfo.ballSize <=
        this.gameInfo.gamexsize - this.gameInfo.barDist
    ) {
      let temp = 0;
      while (temp < this.gameInfo.ballSize) {
        if (
          this.gameInfo.bally + temp <=
            this.gameInfo.twoBary + this.gameInfo.barSize &&
          this.gameInfo.bally + temp >= this.gameInfo.twoBary
        ) {
          const ret =
            (this.gameInfo.bally - this.gameInfo.twoBary) /
            this.gameInfo.barSize;
          [this.gameInfo.ballDirx, this.gameInfo.ballDiry] = this.redirection(
            ret,
            {
              x: this.gameInfo.ballDirx,
              y: this.gameInfo.ballDiry,
            },
          );
          this.gameInfo.ballDirx *= -1;
          return;
        }
        temp++;
      }
    }
  }
  public getMatchInfo() {
    return this.defaultGameInfo;
  }
  constructor(
    isCustom: LobbyCustom,
    matchInfo: gameInfo,
    private readonly prisma: PrismaService = new PrismaService(),
    private readonly achievements: AchievementsService = new AchievementsService(
      prisma,
    ),
  ) {
    this.prisma = new PrismaService();
    this.isCustom = isCustom;
    if (this.isCustom == 'private')
    {
      this.defaultGameInfo = {...normalGameInfo, userId: matchInfo.userId};
    }
    if (this.isCustom == 'custom') {
      this.defaultGameInfo = matchInfo;
      this.gameInfo = { ...matchInfo };
    }
  }
  public readonly isCustom: LobbyCustom;

  public readonly id: string = uuidv4();

  private clients: clientInfo[] = [];

  addClient(client: clientInfo) {
    this.clients.push(client);
  }

  delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  private defaultGameInfo: gameInfo = { ...normalGameInfo };
  private gameInfo: gameInfo = { ...this.defaultGameInfo };
  move() {
    if (this.clients[0].input.direction == 'up')
      if (this.gameInfo.oneBary > 0)
        this.gameInfo.oneBary = this.gameInfo.oneBary - this.gameInfo.barSpeed;
    if (this.clients[0].input.direction == 'down')
      if (
        this.gameInfo.oneBary + this.gameInfo.barSize <
        this.gameInfo.gameysize
      )
        this.gameInfo.oneBary = this.gameInfo.oneBary + this.gameInfo.barSpeed;
    if (this.clients[1].input.direction == 'up')
      if (this.gameInfo.twoBary > 0)
        this.gameInfo.twoBary = this.gameInfo.twoBary - this.gameInfo.barSpeed;
    if (this.clients[1].input.direction == 'down')
      if (
        this.gameInfo.twoBary + this.gameInfo.barSize <
        this.gameInfo.gameysize
      )
        this.gameInfo.twoBary = this.gameInfo.twoBary + this.gameInfo.barSpeed;
    if (this.gameInfo.oneBary + this.gameInfo.barSize > this.gameInfo.gameysize)
      this.gameInfo.oneBary = this.gameInfo.gameysize - this.gameInfo.barSize - 1;
    if (this.gameInfo.twoBary + this.gameInfo.barSize > this.gameInfo.gameysize)
      this.gameInfo.twoBary = this.gameInfo.gameysize - this.gameInfo.barSize - 1;
    if (this.gameInfo.oneBary < 0)
      this.gameInfo.oneBary = 1;
    if (this.gameInfo.twoBary < 0)
      this.gameInfo.twoBary = 1;
  }
  update() {
    this.move();
    this.score();
    let i = this.gameInfo.ballSpeed;
    while (i > 0) {
      this.ballWallRedir();
      this.ballBarRedir();
      this.gameInfo.ballx = this.gameInfo.ballx + this.gameInfo.ballDirx;
      this.gameInfo.bally = this.gameInfo.bally + this.gameInfo.ballDiry;
      i--;
    }
  }

  async start() {
    this.clients[0].socket.emit('server.matchStart', this.defaultGameInfo);
    this.clients[1].socket.emit('server.matchStart', this.defaultGameInfo);
    while (
      this.finish === 0 &&
      this.gameInfo.oneScore < 9 &&
      this.gameInfo.twoScore < 9
    ) {
      this.update();
      this.clients[0].socket.emit('server.update', this.gameInfo);
      this.clients[1].socket.emit('server.update', this.gameInfo);
      await this.delay(20);
    }
    if (this.gameInfo.oneScore == 9) {
      this.win(this.clients[0], this.clients[1]);
      this.lose(this.clients[1]);
    }
    if (this.gameInfo.twoScore == 9) {
      this.win(this.clients[1], this.clients[0]);
      this.lose(this.clients[0]);
    }
    this.clients.forEach((value) => {
      value.lobby = null;
      value.status = 'connected';
    });
    this.disconnectAll();
  }
}
